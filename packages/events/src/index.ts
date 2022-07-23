import { createBot, Intents } from 'discordeno';

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

const restClient = createIpcConnections();

setupMenheraClient(bot);
initializeServices();
setupEventHandlers();
setupInternals(bot, restClient);

export { bot };
