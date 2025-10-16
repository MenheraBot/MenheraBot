import { createBot, startBot } from 'discordeno';

import { setupEventHandlers } from './events/index.js';
import { createIpcConnection } from './structures/orchestratorConnection.js';
import {
  initializeServices,
  setupInternals,
  setupMenheraClient,
} from './structures/menheraClient.js';
import { MenheraClient } from './types/menhera.js';
import { getEnviroments } from './utils/getEnviroments.js';
import { logger } from './utils/logger.js';
import { updateCommandsOnApi } from './utils/updateApiCommands.js';

const { DISCORD_TOKEN, DISCORD_APPLICATION_ID } = getEnviroments([
  'DISCORD_TOKEN',
  'DISCORD_APPLICATION_ID',
]);

const bot = createBot({
  token: DISCORD_TOKEN,
  botId: BigInt(DISCORD_APPLICATION_ID),
  applicationId: BigInt(DISCORD_APPLICATION_ID),
}) as MenheraClient;

setupMenheraClient(bot);
await initializeServices();
setupEventHandlers();

await createIpcConnection();
setupInternals(bot);

if (process.env.NODE_ENV === 'development') {
  logger.debug('Starting local gateway to receive events');
  await startBot(bot);
  // @ts-expect-error Cant send string
  bot.events.ready('MASTER');
}

logger.info('[READY] I am ready to process events!');

if (process.env.NODE_ENV === 'production') updateCommandsOnApi();

export { bot };
