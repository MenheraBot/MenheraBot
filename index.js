require('./src/structures/ProtoTypes').start();

const Client = require('./src/MenheraClient');
const ShardManager = require('./src/structures/ShardManager');
const config = require('./config.json');

const client = new Client({ disableMentions: 'everyone', messageCacheMaxSize: 50 });

if (client.shard) client.shardManager = new ShardManager(client);

client.init();
client.loadCommands('src/commands');
client.loadEvents('src/events');

client.login(config.token)
  .then(() => console.log('[INDEX] Logged in'))
  .catch((e) => console.log(`[FATALERROR] Failure connecting to Discord! ${e.message}!`));
