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
    logger.info('[GATEWAY] Gateway Client closed');
    process.exit(1);
  });

  eventClient.on('ready', () => {
    logger.info('[GATEWAY] Gateway IPC connected');
  });

  restClient.on('close', () => {
    logger.info('[REST] REST Client closed');
    process.exit(1);
  });

  restClient.on('ready', () => {
    logger.info('[REST] REST IPC connected');

    restClient.send({ type: 'IDENTIFY', package: 'EVENTS', id: '0' });
  });

  eventClient.on('message', (msg: { data: DiscordGatewayPayload; shardId: number }) => {
    if (msg.data.t && msg.data.t !== 'RESUMED')
      bot.handlers[msg.data.t]?.(bot, msg.data, msg.shardId);
  });

  if (process.env.TESTING) return restClient;

  await restClient.connect().catch(logger.panic);
  await eventClient.connect().catch(logger.panic);

  return restClient;
};

export { createIpcConnections };
