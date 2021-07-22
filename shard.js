const { ShardingManager } = require('discord.js');
const path = require('path');
require('dotenv').config();

async function startApp() {
  console.log('[APP] Iniciating application...');

  const shardCount = process.env.NODE_ENV === 'development' ? 1 : 'auto';

  const shards = new ShardingManager(path.resolve(__dirname, 'dist', 'index.js'), {
    respawn: true,
    totalShards: shardCount,
    token:
      process.env.NODE_ENV === 'development' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN,
  });

  shards.on('shardCreate', (shard) => {
    console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
  });

  shards.spawn().then(() => console.log('[SHARDING MANAGER] All shards has been spawned'));
}

startApp();
