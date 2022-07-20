import { DiscordGatewayPayload } from 'discordeno/types';
import { Client } from 'net-ipc';
import { bot } from '../index';
import { getEnviroments } from '../config';

const createIpcConnections = () => {
  const { REST_SOCKET_PATH, EVENT_SOCKET_PATH } = getEnviroments([
    'REST_SOCKET_PATH',
    'EVENT_SOCKET_PATH',
  ]);

  const client = new Client({ path: REST_SOCKET_PATH });
  const eventClient = new Client({ path: EVENT_SOCKET_PATH });

  eventClient.on('close', () => {
    console.log('[EVENT] Gateway Client closed');
    process.exit(1);
  });

  eventClient.on('ready', () => {
    console.log('[EVENT] Gateway IPC connected');
  });

  client.on('close', () => {
    console.log('[EVENT] REST Client closed');
    process.exit(1);
  });

  client.on('ready', () => {
    console.log('[EVENT] REST IPC connected');
  });

  const panic = (err: Error) => {
    console.error(err);
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
