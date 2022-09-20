import { BigString } from 'discordeno/types';

import { RedisClient } from '../databases';
import { DatabaseUserThemesSchema } from '../../types/database';
import { debugError } from '../../utils/debugError';
import { userThemesModel } from '../collections';

const parseMongoUserToRedisUser = (user: DatabaseUserThemesSchema): DatabaseUserThemesSchema => ({
  id: `${user.id}`,
  cardsThemes: user.cardsThemes,
  tableThemes: user.tableThemes,
  profileThemes: user.profileThemes,
  cardsBackgroundThemes: user.cardsBackgroundThemes,
  selectedCardTheme: user.selectedCardTheme,
  selectedTableTheme: user.selectedTableTheme,
  selectedProfileTheme: user.selectedProfileTheme,
  selectedCardBackgroundTheme: user.selectedCardBackgroundTheme,
  notifyPurchase: user.notifyPurchase,
});

type AcceptedThemeTypes = 'tableThemes' | 'cardsThemes' | 'cardsBackgroundThemes' | 'profileThemes';

const addThemeToUserAccount = async (
  userId: BigString,
  themeType: AcceptedThemeTypes,
  themeId: number,
): Promise<void> => {
  const updatedUser = await userThemesModel
    .findOneAndUpdate(
      { id: userId },
      { $push: { [themeType]: { id: themeId, aquiredAt: Date.now() } } },
      { new: true },
    )
    .catch(() => null);

  if (updatedUser) {
    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
  }
};

const findEnsuredUserThemes = async (userId: BigString): Promise<DatabaseUserThemesSchema> => {
  const fromRedis = await RedisClient.get(`user_themes:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await userThemesModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) {
    const newUser = await userThemesModel.create({ id: userId });

    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  await RedisClient.setex(
    `user_themes:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const addTableTheme = async (userId: BigString, tableId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'tableThemes', tableId);
};

const addCardsTheme = async (userId: BigString, cardId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'cardsThemes', cardId);
};

const addCardBackgroundTheme = async (userId: BigString, backgroundId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'cardsBackgroundThemes', backgroundId);
};

const addProfileTheme = async (userId: BigString, profileId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'profileThemes', profileId);
};

export default {
  findEnsuredUserThemes,
  addTableTheme,
  addCardsTheme,
  addCardBackgroundTheme,
  addProfileTheme,
};
