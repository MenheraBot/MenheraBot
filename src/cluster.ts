import 'dotenv/config';

import { join } from 'node:path';

import { Manager } from 'discord-hybrid-sharding';

console.log('[APP] Initiating application...');

const SHARD_COUNT = process.env.NODE_ENV === 'development' ? 1 : 'auto';
const DISCORD_TOKEN =
  process.env.NODE_ENV === 'development' ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN;

const ClusterManager = new Manager(join(__dirname, './index.js'), {
  totalShards: SHARD_COUNT,
  totalClusters: 'auto',
  token: DISCORD_TOKEN,
  mode: 'worker',
  keepAlive: {
    interval: 2000,
    maxClusterRestarts: 5,
    maxMissedHeartbeats: 5,
  },
});

ClusterManager.on('clusterCreate', (cluster) => {
  console.warn(`[CLUSTER MANAGER] Launching cluster ${cluster.id}`);
});

ClusterManager.spawn().then(() => {
  console.log('[CLUSTER MANAGER] All clusters have been spawned');
});
