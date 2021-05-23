import ProtoTypes from '@structures/ProtoTypes';
import { resolve } from 'path';
import MenheraClient from './MenheraClient';
import config from '../config.json';

ProtoTypes.start();

const client = new MenheraClient(
  { disableMentions: 'everyone', messageCacheMaxSize: 50 },
  {
    commandsDirectory: resolve(__dirname, 'commands'),
    eventsDirectory: resolve(__dirname, 'events'),
  },
);

async function loadMenhera() {
  await client.init();

  client.login(config.token)
    .then(() => console.log('[INDEX] Logged in'))
    .catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`));
}

loadMenhera();
