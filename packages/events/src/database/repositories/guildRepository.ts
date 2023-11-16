import { BigString } from 'discordeno/types';
import { guildsModel } from '../collections';
import { MainRedisClient } from '../databases';
import { AvailableLanguages } from '../../types/i18next';

const updateGuildLanguage = async (guildId: BigString, language: string): Promise<void> => {
  MainRedisClient.hset(`guild:${guildId}`, 'language', language);

  await guildsModel.updateOne({ id: `${guildId}` }, { lang: language });
};

const getGuildLanguage = async (guildId: BigString): Promise<AvailableLanguages> => {
  const fromRedis = await MainRedisClient.hget(`guild:${guildId}`, 'language');

  if (fromRedis) return fromRedis as AvailableLanguages;

  const fromMongo = await guildsModel.findOne({ id: `${guildId}` });

  if (fromMongo) {
    await MainRedisClient.hset(`guild:${guildId}`, 'language', fromMongo.lang);

    return fromMongo.lang;
  }

  await guildsModel.create({ id: `${guildId}`, lang: 'pt-BR' });

  return 'pt-BR';
};

export default { updateGuildLanguage, getGuildLanguage };
