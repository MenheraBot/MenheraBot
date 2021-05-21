const { ShardingManager } = require('discord.js');
const { token } = require('./config.json');

const shards = new ShardingManager('./index.js', {
  respawn: true,
  totalShards: 4,
  token,
});

shards.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

shards.spawn().then(console.log('[SHARDING MANAGER] Launching shards...'));
