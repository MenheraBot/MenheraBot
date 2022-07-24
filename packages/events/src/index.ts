import { createBot, Intents } from 'discordeno';
import { EventEmitter } from 'node:events';

import { initializeServices, setupInternals, setupMenheraClient } from './structures/menheraClient';
import { createIpcConnections } from './structures/ipcConnections';
import { MenheraClient } from './types/menhera';
import { getEnviroments } from './utils/getEnviroments';
import { setupEventHandlers } from './events/index';

const { DISCORD_TOKEN, REST_AUTHORIZATION, DISCORD_APPLICATION_ID } = getEnviroments([
  'DISCORD_TOKEN',
  'REST_AUTHORIZATION',
  'DISCORD_APPLICATION_ID',
]);

const bot = createBot({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
  intents: Intents.Guilds,
  botId: BigInt(DISCORD_APPLICATION_ID),
  applicationId: BigInt(DISCORD_APPLICATION_ID),
}) as MenheraClient;

const interactionEmitter = new EventEmitter().setMaxListeners(Infinity);

const restClient = await createIpcConnections();

setupMenheraClient(bot);
await initializeServices();
setupEventHandlers();
setupInternals(bot, restClient);

export { bot, interactionEmitter };
