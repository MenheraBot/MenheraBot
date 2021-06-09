import ProtoTypes from '@structures/ProtoTypes';
import { resolve } from 'path';
import MenheraClient from './MenheraClient';
import config from '../config.json';

ProtoTypes.start();

const client = new MenheraClient(
  {
    disableMentions: 'everyone',
    messageCacheMaxSize: 50,
    ws: {
      intents: [
        'GUILDS',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_VOICE_STATES',
      ],
    },
  },
  {
    commandsDirectory: resolve(__dirname, 'commands'),
    eventsDirectory: resolve(__dirname, 'events'),
    ...config,
  },
);

async function loadMenhera() {
  await client.init();

  client
    .login(process.env.NODE_ENV === 'development' ? config.testToken : config.token)
    .then(() => console.log('[INDEX] Logged in'))
    .catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`));
}

loadMenhera();
