import ProtoTypes from '@structures/ProtoTypes';
import ShardManager from '@structures/ShardManager';
import MenheraClient from './MenheraClient';
import config from '../config.json';

ProtoTypes.start();

const client = new MenheraClient({ disableMentions: 'everyone', messageCacheMaxSize: 50 });

if (client.shard) client.shardManager = new ShardManager(client);

async function loadMenhera() {
  await client.init();
  client.loadCommands('src/commands');
  client.loadEvents('src/events');

  client.login(config.token)
    .then(() => console.log('[INDEX] Logged in'))
    .catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`));
}

loadMenhera();
