import { BigString } from 'discordeno/types';
import { guildsModel } from '../collections.js';
import { MainRedisClient } from '../databases.js';
import { AvailableLanguages } from '../../types/i18next.js';
import { registerCacheStatus } from '../../structures/initializePrometheus.js';

const updateGuildLanguage = async (guildId: BigString, language: string): Promise<void> => {
  MainRedisClient.hset(`guild:${guildId}`, 'language', language);

  await guildsModel.updateOne({ id: `${guildId}` }, { lang: language });
};

const getGuildLanguage = async (guildId: BigString): Promise<AvailableLanguages> => {
  const fromRedis = await MainRedisClient.hget(`guild:${guildId}`, 'language');

  registerCacheStatus(fromRedis, 'guild');

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
