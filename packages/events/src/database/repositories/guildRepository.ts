import { BigString } from '@discordeno/bot';
import { guildsModel } from '../collections.js';
import { MainRedisClient } from '../databases.js';
import { AvailableLanguages } from '../../types/i18next.js';
import { registerCacheStatus } from '../../structures/initializePrometheus.js';

const updateGuildLanguage = async (guildId: BigString, language: string): Promise<void> => {
  MainRedisClient.hset(`guild:${guildId}`, 'language', language);

  await guildsModel.updateOne({ id: `${guildId}` }, { lang: language });
};

const getGuildInfo = async (
  guildId: BigString,
): Promise<{ language: AvailableLanguages; disabledCommands: string[] }> => {
  const fromRedis = await MainRedisClient.hmget(
    `guild:${guildId}`,
    'language',
    'disabled_commands',
  );

  registerCacheStatus(fromRedis, 'guild');

  if (fromRedis.length > 0) {
    const language = (fromRedis[0] as AvailableLanguages) || 'pt-BR';
    const commands = fromRedis[1] || '[]';

    return { language, disabledCommands: JSON.parse(commands) };
  }

  const fromMongo = await guildsModel.findOne({ id: `${guildId}` });

  if (fromMongo) {
    await MainRedisClient.hmset(
      `guild:${guildId}`,
      'language',
      fromMongo.lang,
      'disabled_commands',
      JSON.stringify(fromMongo.disabledCommands ?? []),
    );

    return { disabledCommands: fromMongo.disabledCommands, language: fromMongo.lang };
  }

  await guildsModel.create({ id: `${guildId}`, lang: 'pt-BR', disabledCommands: [] });

  return { disabledCommands: [], language: 'pt-BR' };
};

const updateDisabledCommands = async (guildId: BigString, disabledCommands: string[]) => {
  await guildsModel.updateOne({ id: `${guildId}` }, { disabledCommands });

  await MainRedisClient.hset(
    `guild:${guildId}`,
    'disabled_commands',
    JSON.stringify(disabledCommands),
  );
};

export default { updateGuildLanguage, updateDisabledCommands, getGuildInfo };
