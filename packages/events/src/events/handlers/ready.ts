import axios from 'axios';
import { getEnviroments } from '../../utils/getEnviroments';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { startGameLoop } from '../../modules/bicho/bichoManager';
import { logger } from '../../utils/logger';
import { bot } from '../../index';
import { inactivityPunishment } from '../../structures/inactivityPunishment';
import { getEventsClient } from '../../structures/ipcConnections';

const postBotStatus = async (): Promise<void> => {
  const { DISCORD_APPLICATION_ID, DBL_TOKEN } = getEnviroments([
    'DISCORD_APPLICATION_ID',
    'DBL_TOKEN',
  ]);

  const info = (await getEventsClient().request({ type: 'GUILD_COUNT' })) as {
    guilds: number;
    shards: number;
  } | null;

  if (process.env.NODE_ENV !== 'PRODUCTION')
    return logger.debug(
      `[TOP.GG] Posting bot status: ${
        info ? `${info.guilds} guilds, ${info.shards} shards` : 'sharding not ended yet'
      } `,
    );

  if (!info) return;

  await axios.post(
    `https://top.gg/api/bots/${DISCORD_APPLICATION_ID}/stats`,
    {
      server_count: info.guilds,
      shard_count: info.shards,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: DBL_TOKEN,
      },
    },
  );
};

const setReadyEvent = (): void => {
  bot.events.ready = async () => {
    logger.info(`[MASTER] I was set as the events master instance. Initializing master services`);

    await startGameLoop();

    await blacklistRepository.flushBannedUsers();
    const allBannedUsers = await blacklistRepository.getAllBannedUsersIdFromMongo();
    await blacklistRepository.addBannedUsers(allBannedUsers);

    inactivityPunishment();
    setInterval(postBotStatus, 1800000);
  };
};

export { setReadyEvent };
