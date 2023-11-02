import { Localization } from 'discordeno/types';

import { MainRedisClient } from '../databases';
import { titlesModel } from '../collections';
import { DatabaseTitlesSchema } from '../../types/database';

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

const getTitleInfo = async (titleId: number): Promise<DatabaseTitlesSchema | null> => {
  const fromRedis = await MainRedisClient.get(`title:${titleId}`);

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

export default { registerTitle, getTitleInfo };
