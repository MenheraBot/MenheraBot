import 'dotenv/config';

import { ShardingManager } from 'discord.js-light';
import { join } from 'node:path';

console.log('[APP] Initiating application...');

const SHARD_COUNT = process.env.NODE_ENV === 'development' ? 1 : 'auto';
const DISCORD_TOKEN =
  process.env.NODE_ENV === 'development' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;

const shards = new ShardingManager(join(__dirname, './index.js'), {
  respawn: true,
  totalShards: SHARD_COUNT,
  token: DISCORD_TOKEN,
  mode: 'worker',
});

shards.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

shards.spawn({ timeout: 120_000 }).then(() => {
  console.log('[SHARDING MANAGER] All shards have been spawned');
});
