import { BigString } from 'discordeno/types';

import { MainRedisClient } from '../databases.js';
import { themeCreditsModel } from '../collections.js';
import { DatabaseCreditsSchema } from '../../types/database.js';
import starsRepository from './starsRepository.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { ApiTransactionReason } from '../../types/api.js';
import { registerCacheStatus } from '../../structures/initializePrometheus.js';

const registerTheme = async (
  themeId: number,
  ownerId: BigString,
  royalty: number,
): Promise<void> => {
  await themeCreditsModel.create({
    ownerId,
    themeId,
    royalty,
    totalEarned: 0,
    registeredAt: Date.now(),
    timesSold: 0,
  });
};

const getThemesOwnerId = async (
  themeIds: number[],
): Promise<{ themeId: number; ownerId: string }[]> => {
  return themeCreditsModel
    .find({ themeId: { $in: themeIds } }, ['ownerId', 'themeId'])
    .then((res) => res.map((a) => ({ themeId: a.themeId, ownerId: a.ownerId })));
};

const getDesignerThemes = async (designerId: BigString): Promise<DatabaseCreditsSchema[]> =>
  themeCreditsModel.find({ ownerId: `${designerId}` });

const getThemeInfo = async (themeId: number): Promise<DatabaseCreditsSchema | null> => {
  const fromRedis = await MainRedisClient.get(`credits:${themeId}`);

  registerCacheStatus(fromRedis, 'credits');

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await themeCreditsModel.findOne({ themeId });

  if (fromMongo)
    MainRedisClient.set(
      `credits:${themeId}`,
      JSON.stringify({
        themeId: fromMongo.themeId,
        ownerId: `${fromMongo.ownerId}`,
        registeredAt: fromMongo.registeredAt,
        totalEarned: fromMongo.totalEarned,
        royalty: fromMongo.royalty,
        timesSold: fromMongo.timesSold,
      }),
    );

  return fromMongo;
};

const giveOwnerThemeRoyalties = async (themeId: number, value: number): Promise<void> => {
  const themeData = (await themeCreditsModel.findOneAndUpdate(
    { themeId },
    { $inc: { totalEarned: value, timesSold: 1 } },
    { new: true },
  )) as DatabaseCreditsSchema;

  MainRedisClient.set(
    `credits:${themeId}`,
    JSON.stringify({
      themeId: themeData.themeId,
      ownerId: `${themeData.ownerId}`,
      registeredAt: themeData.registeredAt,
      totalEarned: themeData.totalEarned,
      royalty: themeData.royalty,
      timesSold: themeData.timesSold,
    }),
  );

  await starsRepository.addStars(themeData.ownerId, value);
  await postTransaction(
    `${bot.id}`,
    `${themeData.ownerId}`,
    value,
    'estrelinhas',
    ApiTransactionReason.BUY_THEME_ROYALTY,
  );
};

export default {
  registerTheme,
  getThemesOwnerId,
  getThemeInfo,
  giveOwnerThemeRoyalties,
  getDesignerThemes,
};
