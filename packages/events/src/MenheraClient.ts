import { getEnviroments } from 'config';
import { Bot, createRestManager } from 'discordeno';
import { runMethod } from 'internals/rest/runMethod';
import { Client } from 'net-ipc';
import { loadLocales } from 'structures/LocalteStructure';
import { initializeSentry } from 'structures/Sentry';
import { MenheraClient } from './types/menhera';

const setupMenheraClient = (client: MenheraClient) => {
  client.commands = new Map();
};

const initializeThirdParties = () => {
  loadLocales();
  initializeSentry();
};

const setupInternals = (bot: Bot, restIPC: Client) => {
  const { DISCORD_TOKEN, REST_AUTHORIZATION } = getEnviroments([
    'DISCORD_TOKEN',
    'REST_AUTHORIZATION',
  ]);

  bot.rest = createRestManager({
    token: DISCORD_TOKEN,
    secretKey: REST_AUTHORIZATION,
    runMethod: async (rest, method, route, body, options) =>
      runMethod(restIPC, rest, method, route, body, options),
  });
};

export { setupMenheraClient, initializeThirdParties, setupInternals };
