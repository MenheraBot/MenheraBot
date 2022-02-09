import 'dotenv/config';

import { ShardingManager } from 'discord.js-light';
import { join } from 'node:path';
import mongoose from 'mongoose';
import MenheraClient from 'MenheraClient';

console.log('[APP] Initiating application...');

const SHARD_COUNT = process.env.NODE_ENV === 'development' ? 1 : 'auto';
const DISCORD_TOKEN =
  process.env.NODE_ENV === 'development' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;

const ShardManager = new ShardingManager(join(__dirname, './index.js'), {
  respawn: true,
  totalShards: SHARD_COUNT,
  token: DISCORD_TOKEN,
  mode: 'worker',
});

ShardManager.on('shardCreate', (shard) => {
  console.warn(`[SHARDING MANAGER] Launching shard ${shard.id}`);
});

ShardManager.spawn({ timeout: 120_000 }).then((a) => {
  console.log('[SHARDING MANAGER] All shards have been spawned');
  [...a.values()].forEach((b) =>
    b.eval(
      // @ts-expect-error Client n é o sexo
      (c: MenheraClient, { manager }: { manager: number }) => {
        c.shardManagerPID = manager;
      },
      { manager: process.pid },
    ),
  );
});

process.on('SIGINT', () => () => {
  mongoose.disconnect(() => {
    process.exit(0);
  });
});
