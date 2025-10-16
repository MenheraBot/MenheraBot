import { Collection, createRestManager, handleInteractionCreate } from 'discordeno';

import { transformInteractionResponseToDiscordInteractionResponse } from '../internals/transformers/reverse/interactionResponse.js';
import { initializeRedis, initializeMongo } from '../database/databases.js';
import { loadLocales } from './localeStructure.js';
import { initializeSentry } from './initializeSentry.js';
import { getEnviroments } from '../utils/getEnviroments.js';
import { MenheraClient } from '../types/menhera.js';
import { logger } from '../utils/logger.js';
import { updateAssets } from './cdnManager.js';
import { initializePrometheus } from './initializePrometheus.js';
import { transformDiscordUserToUser } from '../internals/transformers/reverse/transformDiscordUserToUser.js';
import { transfromUserToDiscordUser } from '../internals/transformers/transformUserToDiscordUser.js';
import { transformComponentToDiscordComponent } from '../internals/transformers/reverse/component.js';
import { loadChangelog } from '../utils/changelog.js';
import { freeStuckQueues } from '../utils/freeStuckQueues.js';
import { loadCommands } from './command/loadCommands.js';

const setupMenheraClient = (client: MenheraClient): void => {
  const { OWNER_ID } = getEnviroments(['OWNER_ID']);

  logger.debug('Setting up Menhera Client');

  client.commands = new Collection();

  client.ownerId = BigInt(OWNER_ID);

  client.username = 'Menhera Bot';

  client.enableRatelimit = true;

  client.shuttingDown = false;

  client.isMaster = false;

  client.prodLogSwitch = false;

  client.changelog = null;

  client.commandsInExecution = 0;

  client.respondInteraction = new Map();

  client.ackInteraction = new Map();
};

const initializeServices = async (): Promise<void> => {
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

  logger.debug('Setting up the custom rest manager');

  bot.rest = createRestManager({
    token: DISCORD_TOKEN,
  });

  bot.transformers.reverse.interactionResponse =
    transformInteractionResponseToDiscordInteractionResponse;

  bot.transformers.reverse.component = transformComponentToDiscordComponent;

  bot.transformers.user = transformDiscordUserToUser;
  bot.transformers.reverse.user = transfromUserToDiscordUser;

  bot.handlers.INTERACTION_CREATE = handleInteractionCreate;

  freeStuckQueues(bot);
};

export { setupMenheraClient, initializeServices, setupInternals };
