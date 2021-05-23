const { ShardingManager } = require('discord.js');
const path = require('path');
const config = require('./config.json');

const shards = new ShardingManager(path.resolve(__dirname, 'dist', 'index.js'), {
  respawn: true,
  totalShards: 'auto',
  token: config.token,
});

shards.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

shards.spawn().then(() => console.log('[SHARDING MANAGER] Launching shards...'));
