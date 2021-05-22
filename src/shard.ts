import { ShardingManager } from 'discord.js';
import path from 'path';
import config from '../config.json';

const mainFilename = process.env.NODE_ENV === 'production' ? 'index.js' : 'index.js';
const shards = new ShardingManager(path.resolve(__dirname, mainFilename), {
  respawn: true,
  totalShards: 'auto',
  token: config.token,
});

shards.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

shards.spawn().then(() => console.log('[SHARDING MANAGER] Launching shards...'));
