import { ShardingManager } from 'discord.js';
import config from './config.json';

const shards = new ShardingManager('./index.js', {
  respawn: true,
  totalShards: 'auto',
  token: config.token,
});

shards.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

shards.spawn().then(() => console.log('[SHARDING MANAGER] Launching shards...'));
