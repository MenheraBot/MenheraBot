import { DiscordGatewayPayload } from 'discordeno/types';
import { Client } from 'net-ipc';
import { logger } from 'utils/logger';
import { bot } from '../index';
import { getEnviroments } from '../utils/getEnviroments';

const createIpcConnections = () => {
  const { REST_SOCKET_PATH, EVENT_SOCKET_PATH } = getEnviroments([
    'REST_SOCKET_PATH',
    'EVENT_SOCKET_PATH',
  ]);

  const client = new Client({ path: REST_SOCKET_PATH });
  const eventClient = new Client({ path: EVENT_SOCKET_PATH });

  eventClient.on('close', () => {
    logger.info('[EVENT] Gateway Client closed');
    process.exit(1);
  });

  eventClient.on('ready', () => {
    logger.info('[EVENT] Gateway IPC connected');
  });

  client.on('close', () => {
    logger.info('[EVENT] REST Client closed');
    process.exit(1);
  });

  client.on('ready', () => {
    logger.info('[EVENT] REST IPC connected');
  });

  const panic = (err: Error) => {
    logger.error(err);
    process.exit(1);
  };

  client.connect().catch(panic);
  eventClient.connect().catch(panic);

  eventClient.on('message', (msg) => {
    const json = JSON.parse(msg) as {
      data: DiscordGatewayPayload;
      shardId: number;
    };

    if (json.data.t && json.data.t !== 'RESUMED')
      bot.handlers[json.data.t]?.(bot, json.data, json.shardId);
  });

  return eventClient;
};

export { createIpcConnections };
