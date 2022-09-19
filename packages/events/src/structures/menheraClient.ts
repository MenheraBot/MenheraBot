import { Bot, createRestManager } from 'discordeno';
import { Client } from 'net-ipc';

import { initializeRedis, initializeMongo } from '../database/databases';
import { startGame as startBichoGame } from '../modules/bicho/bichoManager';
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

  client.commands = new Map();

  client.ownerId = BigInt(OWNER_ID);

  loadCommands();
};

const initializeServices = async (): Promise<void> => {
  await initializeMongo();
  await initializeRedis();
  await loadLocales();
  initializeSentry();
  startBichoGame();
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
  });
};

export { setupMenheraClient, initializeServices, setupInternals };