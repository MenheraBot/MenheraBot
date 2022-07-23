import { Bot, createRestManager } from 'discordeno';
import { Client } from 'net-ipc';

import { startGame as startBichoGame } from '../modules/bicho/bichoManager';
import { runMethod } from '../internals/rest/runMethod';
import { loadLocales } from './localteStructure';
import { initializeSentry } from './initializeSentry';
import { getEnviroments } from '../utils/getEnviroments';
import { MenheraClient } from '../types/menhera';
import { logger } from '../utils/logger';
import { loadCommands } from './command/loadCommands';

const setupMenheraClient = (client: MenheraClient): void => {
  logger.debug('Setting up Menhera Client');
  client.commands = new Map();

  logger.debug('Loading Commands');
  loadCommands();
  logger.debug('after Commands');
};

const initializeServices = (): void => {
  logger.debug('LLoading Locales');
  loadLocales();

  logger.debug('Initializing Sentry');
  initializeSentry();

  logger.debug('Starting Bicho Game');
  startBichoGame();
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