import { createBot, Intents } from 'discordeno';
import { initializeThirdParties, setupInternals, setupMenheraClient } from 'MenheraClient';
import { createIpcConnections } from 'structures/IpcConnections';
import { MenheraClient } from 'types/menhera';
import { getEnviroments } from './config';
import { setupEventHandlers } from './events/index';

const { DISCORD_TOKEN, REST_AUTHORIZATION, DISCORD_APPLICATION_ID } = getEnviroments();

const bot = createBot({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
  intents: Intents.Guilds,
  botId: DISCORD_APPLICATION_ID,
  applicationId: DISCORD_APPLICATION_ID,
});

const eventClient = createIpcConnections();

setupMenheraClient(bot as MenheraClient);
initializeThirdParties();
setupEventHandlers();
setupInternals(bot, eventClient);

export { bot };
