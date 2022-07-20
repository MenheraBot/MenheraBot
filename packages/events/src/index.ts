import {
  createBot,
  createRestManager,
  DiscordGatewayPayload,
  Intents,
  RestManager,
} from 'discordeno';
import { Client } from 'net-ipc';
import { initializeThirdParties, setupMenheraClient } from 'MenheraClient';
import { MenheraClient } from 'types/menhera';
import { getEnviroments } from './config';
import { RequestMethod, runMethod } from './internals/rest/runMethod';
import { setupEventHandlers } from './events/index';

const {
  DISCORD_TOKEN,
  REST_AUTHORIZATION,
  REST_SOCKET_PATH,
  EVENT_SOCKET_PATH,
  DISCORD_APPLICATION_ID,
} = getEnviroments();

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

const bot = createBot({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
  intents: Intents.Guilds,
  botId: DISCORD_APPLICATION_ID,
  applicationId: DISCORD_APPLICATION_ID,
});

setupMenheraClient(bot as MenheraClient);
initializeThirdParties();
setupEventHandlers();

bot.rest = createRestManager({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
  runMethod: async (
    rest: RestManager,
    method: RequestMethod,
    route: string,
    body?: unknown,
    options?: {
      retryCount?: number;
      bucketId?: string;
      headers?: Record<string, string>;
    },
  ) => runMethod(client, rest, method, route, body, options),
});

eventClient.on('message', (msg) => {
  const json = JSON.parse(msg) as {
    data: DiscordGatewayPayload;
    shardId: number;
  };

  if (json.data.t && json.data.t !== 'RESUMED')
    bot.handlers[json.data.t]?.(bot, json.data, json.shardId);
});

export { bot };
