import 'dotenv/config';

import { ShardingManager } from 'discord.js';
import { join } from 'path';

console.log('[APP] Initiating application...');

const SHARD_COUNT = process.env.NODE_ENV === 'development' ? 1 : 'auto';
const DISCORD_TOKEN =
  process.env.NODE_ENV === 'development' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;

const shards = new ShardingManager(join(__dirname, './index.js'), {
  respawn: true,
  totalShards: SHARD_COUNT,
  token: DISCORD_TOKEN,
});

shards.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

shards.spawn().then(() => console.log('[SHARDING MANAGER] All shards has been spawned'));
