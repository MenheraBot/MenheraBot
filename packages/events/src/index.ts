import { createBot, startBot } from 'discordeno';

import { setupEventHandlers } from './events/index';
import { createIpcConnections } from './structures/ipcConnections';
import { initializeServices, setupInternals, setupMenheraClient } from './structures/menheraClient';
import { MenheraClient } from './types/menhera';
import { getEnviroments } from './utils/getEnviroments';
import { logger } from './utils/logger';
import { updateCommandsOnApi } from './utils/updateApiCommands';

const { DISCORD_TOKEN, REST_AUTHORIZATION, DISCORD_APPLICATION_ID } = getEnviroments([
  'DISCORD_TOKEN',
  'REST_AUTHORIZATION',
  'DISCORD_APPLICATION_ID',
]);

const bot = createBot({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
  botId: BigInt(DISCORD_APPLICATION_ID),
  applicationId: BigInt(DISCORD_APPLICATION_ID),
}) as MenheraClient;

setupMenheraClient(bot);
await initializeServices();
setupEventHandlers();

const restClient = await createIpcConnections();
setupInternals(bot, restClient);

logger.info('[READY] Events are being processed!');

if (process.env.NODE_ENV === 'production') updateCommandsOnApi();

if (process.env.NODE_ENV === 'development') {
  logger.debug('Starting local gateway to receive events');
  startBot(bot);
}

export { bot };
