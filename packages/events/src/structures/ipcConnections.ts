import { DiscordGatewayPayload } from 'discordeno/types';
import { Client } from 'net-ipc';

import { logger } from '../utils/logger';
import { bot } from '../index';
import { getEnviroments } from '../utils/getEnviroments';

const createIpcConnections = async (): Promise<Client> => {
  const { REST_SOCKET_PATH, EVENT_SOCKET_PATH } = getEnviroments([
    'REST_SOCKET_PATH',
    'EVENT_SOCKET_PATH',
  ]);

  logger.debug(
    `Creating IPC connections to REST ${REST_SOCKET_PATH} and EVENTS ${EVENT_SOCKET_PATH}`,
  );

  const restClient = new Client({ path: REST_SOCKET_PATH });
  const eventClient = new Client({ path: EVENT_SOCKET_PATH });

  eventClient.on('close', () => {
    logger.info('[EVENT] Gateway Client closed');
    process.exit(1);
  });

  eventClient.on('ready', () => {
    logger.info('[EVENT] Gateway IPC connected');
  });

  restClient.on('close', () => {
    logger.info('[EVENT] REST Client closed');
    process.exit(1);
  });

  restClient.on('ready', () => {
    logger.info('[EVENT] REST IPC connected');
  });

  eventClient.on('message', (msg: { data: DiscordGatewayPayload; shardId: number }) => {
    if (msg.data.t && msg.data.t !== 'RESUMED')
      bot.handlers[msg.data.t]?.(bot, msg.data, msg.shardId);
  });

  await restClient.connect().catch(logger.panic);
  await eventClient.connect().catch(logger.panic);

  return restClient;
};

export { createIpcConnections };
