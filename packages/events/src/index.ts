import { createBot, Intents } from 'discordeno';

import { logger } from './utils/logger';
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

setupMenheraClient(bot);
await initializeServices();
setupEventHandlers();

const restClient = await createIpcConnections();
setupInternals(bot, restClient);

logger.info('[READY] Events are being processed!');

export { bot };
