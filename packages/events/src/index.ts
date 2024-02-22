import { createBot, startBot } from 'discordeno';

import { setupEventHandlers } from './events/index';
import { createIpcConnection } from './structures/orchestratorConnection';
import { initializeServices, setupInternals, setupMenheraClient } from './structures/menheraClient';
import { MenheraClient } from './types/menhera';
import { getEnviroments } from './utils/getEnviroments';
import { logger } from './utils/logger';
import { updateCommandsOnApi } from './utils/updateApiCommands';

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

logger.info('[READY] I am ready to process events!');

if (process.env.NODE_ENV === 'development') {
  await startBot(bot);

  // @ts-expect-error Not expected string here
  bot.events.ready('MASTER');
}

if (process.env.NODE_ENV === 'production') updateCommandsOnApi();

export { bot };
