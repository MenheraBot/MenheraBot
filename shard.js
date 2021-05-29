const { ShardingManager } = require('discord.js');
const path = require('path');

const shards = new ShardingManager(path.resolve(__dirname, 'dist', 'index.js'), {
  respawn: true,
  totalShards: 4,
});

shards.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

shards.spawn().then(() => console.log('[SHARDING MANAGER] All shards has been spawned'));
