import { Collection, createRestManager, handleInteractionCreate } from 'discordeno';

import { transformInteractionResponseToDiscordInteractionResponse } from '../internals/transformers/reverse/interactionResponse';
import { initializeRedis, initializeMongo } from '../database/databases';
import { loadLocales } from './localeStructure';
import { initializeSentry } from './initializeSentry';
import { getEnviroments } from '../utils/getEnviroments';
import { MenheraClient } from '../types/menhera';
import { logger } from '../utils/logger';
import { updateAssets } from './cdnManager';
import { initializePrometheus } from './initializePrometheus';
import { transformDiscordUserToUser } from '../internals/transformers/reverse/transformDiscordUserToUser';
import { transfromUserToDiscordUser } from '../internals/transformers/transformUserToDiscordUser';
import { transformComponentToDiscordComponent } from '../internals/transformers/reverse/component';
import { loadChangelog } from '../utils/changelog';
import { freeStuckQueues } from '../utils/freeStuckQueues';
import { loadCommands } from './command/loadCommands';

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
