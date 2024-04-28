import { BigString, Localization } from 'discordeno/types';

import { MainRedisClient } from '../databases';
import { titlesModel } from '../collections';
import { DatabaseTitlesSchema } from '../../types/database';
import { registerCacheStatus } from '../../structures/initializePrometheus';

const parseMongoDataToRedis = (title: DatabaseTitlesSchema): DatabaseTitlesSchema => ({
  registeredAt: title.registeredAt,
  text: title.text,
  textLocalizations: title.textLocalizations,
  titleId: title.titleId,
});

const registerTitle = async (
  titleId: number,
  text: string,
  translation: Localization,
): Promise<void> => {
  await titlesModel.create({
    titleId,
    text,
    textLocalizations: translation,
    registeredAt: Date.now(),
  });
};

const getTitlesCount = async (): Promise<number> => titlesModel.countDocuments();

const getTitleInfo = async (titleId: number): Promise<DatabaseTitlesSchema | null> => {
  const fromRedis = await MainRedisClient.get(`title:${titleId}`);

  registerCacheStatus(fromRedis, 'title');

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await titlesModel.findOne({ titleId });

  if (fromMongo)
    MainRedisClient.set(
      `title:${titleId}`,
      JSON.stringify({
        titleId: fromMongo.titleId,
        text: fromMongo.text,
        textLocalizations: fromMongo.textLocalizations,
        registeredAt: fromMongo.registeredAt,
      }),
    );

  return fromMongo;
};

const getTitles = async (userId: BigString, titles: number[]): Promise<DatabaseTitlesSchema[]> => {
  const fromRedis = await MainRedisClient.get(`titles:${userId}`);

  registerCacheStatus(fromRedis, 'titles');

  if (fromRedis) return JSON.parse(fromRedis);

  const allTitles = await titlesModel.find({ titleId: { $in: titles } });

  MainRedisClient.setex(
    `titles:${userId}`,
    3600,
    JSON.stringify(allTitles.map(parseMongoDataToRedis)),
  );

  return allTitles;
};

export default { registerTitle, getTitleInfo, getTitlesCount, getTitles };
