import { BigString } from 'discordeno/types';
import { guildsModel } from '../collections';
import { RedisClient } from '../databases';

const updateGuildLanguage = async (guildId: BigString, language: string): Promise<void> => {
  await RedisClient.setex(`language:${guildId}`, 3600, language);
  await guildsModel.updateOne({ id: `${guildId}` }, { lang: language });
};

const getGuildLanguage = async (guildId: BigString): Promise<string> => {
  const fromRedis = await RedisClient.get(`language:${guildId}`);

  if (fromRedis) return fromRedis;

  const fromMongo = await guildsModel.findOne({ id: `${guildId}` });

  if (fromMongo) {
    await RedisClient.setex(`language:${guildId}`, 3600, fromMongo.lang);

    return fromMongo.lang;
  }

  await guildsModel.create({ id: `${guildId}`, lang: 'pt-BR' });

  return 'pt-BR';
};

export default { updateGuildLanguage, getGuildLanguage };
