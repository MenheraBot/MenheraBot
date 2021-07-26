import { ShardingManager } from 'discord.js';

import { config } from 'dotenv';

import { join } from 'path';

config();

(async () => {
  console.log('[APP] Initiating application...');

  const shardCount = process.env.NODE_ENV === 'development' ? 1 : 'auto';

  const shards = new ShardingManager(join(__dirname, './index.js'), {
    respawn: true,
    totalShards: shardCount,
    token:
      process.env.NODE_ENV === 'development' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN,
  });

  shards.on('shardCreate', (shard) => {
    console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
  });

  shards.spawn().then(() => console.log('[SHARDING MANAGER] All shards have been spawned'));
})();
