import { createBot, DesiredPropertiesBehavior } from '@discordeno/bot';

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
  applicationId: BigInt(DISCORD_APPLICATION_ID),
  desiredPropertiesBehavior: DesiredPropertiesBehavior.RemoveKey,
  desiredProperties: {
    user: {
      avatar: true,
      discriminator: true,
      globalName: true,
      id: true,
      locale: true,
      toggles: true,
      username: true,
    },
    attachment: {
      contentType: true,
      url: true,
      size: true,
    },
    // TODO
    component: {}
  }
}) as MenheraClient;

setupMenheraClient(bot);
await initializeServices();
setupEventHandlers();

await createIpcConnection();
setupInternals(bot);

if (process.env.NODE_ENV === 'development') {
  logger.debug('Starting local gateway to receive events');
  await bot.start()
  // @ts-expect-error Cant send string
  bot.events.ready('MASTER');
}

logger.info('[READY] I am ready to process events!');

if (process.env.NODE_ENV === 'production') updateCommandsOnApi();

export { bot };
