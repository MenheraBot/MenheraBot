import { resolve } from 'path';
import MenheraClient from './MenheraClient';

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
  },
);

async function loadMenhera() {
  await client.init();

  client.login(process.env.NODE_ENV === 'development' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN)
    .then(() => console.log('[INDEX] Logged in'))
    .catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`));
}

loadMenhera();
