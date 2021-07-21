import { ShardingManager } from 'discord.js';

import path from 'path';

import { config } from 'dotenv';

config();

(async () => {
  console.log('[APP] Iniciating application...');

  const shardCount = process.env.NODE_ENV === 'development' ? 1 : 5;

  const shards = new ShardingManager(path.resolve(__dirname, 'dist', 'index.js'), {
    respawn: true,
    totalShards: shardCount,
  });

  shards.on('shardCreate', (shard) => {
    console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
  });

  shards.spawn().then(() => console.log('[SHARDING MANAGER] All shards has been spawned'));
})();
