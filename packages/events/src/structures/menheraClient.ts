import { Bot, Collection, createRestManager, handleInteractionCreate } from 'discordeno';
import { Client } from 'net-ipc';

import { transformInteractionResponseToDiscordInteractionResponse } from '../internals/transformers/reverse/interactionResponse';
import { sendRequest } from '../internals/rest/sendRequest';
import { initializeRedis, initializeMongo } from '../database/databases';
import { runMethod } from '../internals/rest/runMethod';
import { loadLocales } from './localteStructure';
import { initializeSentry } from './initializeSentry';
import { getEnviroments } from '../utils/getEnviroments';
import { MenheraClient } from '../types/menhera';
import { logger } from '../utils/logger';
import { loadCommands } from './command/loadCommands';
import { updateAssets } from './cdnManager';

const setupMenheraClient = (client: MenheraClient): void => {
  const { OWNER_ID } = getEnviroments(['OWNER_ID']);

  logger.debug('Setting up Menhera Client');

  client.commands = new Collection();

  client.ownerId = BigInt(OWNER_ID);

  client.username = 'Menhera Bot';

  client.shuttingDown = false;

  client.isMaster = false;

  client.commandsInExecution = 0;

  loadCommands();
};

const initializeServices = async (): Promise<void> => {
  await loadLocales();

  if (process.env.TESTING) return;

  await initializeMongo();
  await initializeRedis();
  initializeSentry();
  await updateAssets();
};

const setupInternals = (bot: Bot, restIPC: Client): void => {
  const { DISCORD_TOKEN, REST_AUTHORIZATION } = getEnviroments([
    'DISCORD_TOKEN',
    'REST_AUTHORIZATION',
  ]);

  logger.debug('Setting up the custom rest manager');

  bot.rest = createRestManager({
    token: DISCORD_TOKEN,
    secretKey: REST_AUTHORIZATION,
    runMethod: async (rest, method, route, body, options) =>
      runMethod(restIPC, rest, method, route, body, options),
    sendRequest: async (rest, options) =>
      sendRequest(
        restIPC,
        rest,
        options.method,
        options.url,
        options.bucketId,
        options.retryCount,
        options.payload,
      ),
  });

  bot.transformers.reverse.interactionResponse =
    transformInteractionResponseToDiscordInteractionResponse;

  bot.handlers.INTERACTION_CREATE = handleInteractionCreate;
};

export { setupMenheraClient, initializeServices, setupInternals };
