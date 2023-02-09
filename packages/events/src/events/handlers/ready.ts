import { createHttpServer, registerAllRouters } from '../../structures/server/httpServer';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { startGameLoop } from '../../modules/bicho/bichoManager';
import { logger } from '../../utils/logger';
import { bot } from '../../index';
import { inactivityPunishment } from '../../structures/inactivityPunishment';
import { postShardStatuses } from '../../utils/apiRequests/commands';
import { getEventsClient } from '../../structures/ipcConnections';

const postShardStatus = async (): Promise<void> => {
  const eventsClient = getEventsClient();

  if (!eventsClient) return;

  const shardsInfo = await eventsClient.request({ type: 'SHARDS_INFO' }).catch(() => null);

  if (!shardsInfo) return;

  const toSendData = shardsInfo.map(
    (shard: {
      workerId: number;
      guilds: number;
      shardId: number;
      uptime: number;
      ping: number;
    }) => {
      return {
        clusterId: shard.workerId,
        guilds: shard.guilds,
        id: shard.shardId,
        uptime: shard.uptime,
        ping: shard.ping,
        lastPingAt: Date.now(),
        unavailable: 0,
        connected: shard.uptime,
        members: 0,
        memoryUsed: 0,
      };
    },
  );

  await postShardStatuses(toSendData);
};

const setReadyEvent = (): void => {
  bot.events.ready = async () => {
    if (bot.isMaster) return;

    bot.isMaster = true;

    logger.info(`[MASTER] I was set as the events master instance. Initializing master services`);

    await startGameLoop();

    await blacklistRepository.flushBannedUsers();
    const allBannedUsers = await blacklistRepository.getAllBannedUsersIdFromMongo();
    await blacklistRepository.addBannedUsers(allBannedUsers);

    if (process.env.NOMICRERVICES) return;

    inactivityPunishment();
    setInterval(postShardStatus, 60_000);

    createHttpServer();
    registerAllRouters();
  };
};

export { setReadyEvent };
