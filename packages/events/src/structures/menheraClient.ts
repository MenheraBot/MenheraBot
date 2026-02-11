import { Collection, createRestManager } from '@discordeno/bot';

import { initializeRedis, initializeMongo } from '../database/databases.js';
import { loadLocales } from './localeStructure.js';
import { initializeSentry } from './initializeSentry.js';
import { getEnviroments } from '../utils/getEnviroments.js';
import { MenheraClient } from '../types/menhera.js';
import { updateAssets } from './cdnManager.js';
import { initializePrometheus } from './initializePrometheus.js';
import { loadChangelog } from '../utils/changelog.js';
import { freeStuckQueues } from '../utils/freeStuckQueues.js';
import { loadCommands } from './command/loadCommands.js';

const { CDN_URL } = getEnviroments(['CDN_URL']);

const setupMenheraClient = (client: MenheraClient): void => {
  const { OWNER_ID } = getEnviroments(['OWNER_ID']);

  client.commands = new Collection();

  client.ownerId = BigInt(OWNER_ID);

  client.username = 'Menhera Bot';

  client.enableRatelimit = true;

  client.cdnUrl = CDN_URL;

  client.shuttingDown = false;

  client.isMaster = false;

  client.prodLogSwitch = false;

  client.changelog = null;

  client.commandsInExecution = 0;
};

const initializeServices = async (bot: MenheraClient): Promise<void> => {
  await loadLocales();
  await loadChangelog();

  if (process.env.NODE_ENV === 'test') return;

  await initializeMongo();
  await initializeRedis();
  initializeSentry();
  await updateAssets();
  initializePrometheus();
  loadCommands();
};

const setupInternals = (bot: MenheraClient): void => {
  const { DISCORD_TOKEN } = getEnviroments(['DISCORD_TOKEN']);

  bot.rest = createRestManager({
    token: DISCORD_TOKEN,
  });

  freeStuckQueues(bot);
};

export { setupMenheraClient, initializeServices, setupInternals };
