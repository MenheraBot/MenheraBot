import { Client, Server } from 'net-ipc';
import { Collection, createGatewayManager, Intents, routes } from 'discordeno';

import { Worker } from 'worker_threads';

import config from './config';
import restRequest from './restRequest';

const { DISCORD_TOKEN, REST_AUTHORIZATION, REST_SOCKET_PATH, EVENT_HANDLER_SOCKET_PATH } = config();

const client = new Client({ path: REST_SOCKET_PATH });
const server = new Server({ path: EVENT_HANDLER_SOCKET_PATH });

client.on('close', () => {
  console.log('[GATEWAY] REST Client closed');
  process.exit(1);
});

server.on('ready', () => {
  console.log('[GATEWAY] Event Handler Server started');
});

const panic = (err: Error) => {
  console.error(err);
  process.exit(1);
};

client.connect().catch(panic);
server.start().catch(panic);

const workers = new Collection<number, Worker>();

async function startGateway() {
  const results = await restRequest(client, {
    Authorization: REST_AUTHORIZATION,
    body: undefined,
    method: 'GET',
    url: routes.GATEWAY_BOT(),
  }).then((res) => ({
    url: res.url,
    shards: res.shards,
    sessionStartLimit: {
      total: res.session_start_limit.total,
      remaining: res.session_start_limit.remaining,
      resetAfter: res.session_start_limit.reset_after,
      maxConcurrency: res.session_start_limit.max_concurrency,
    },
  }));

  const gateway = createGatewayManager({
    gatewayBot: results,
    gatewayConfig: {
      token: DISCORD_TOKEN,
      intents: Intents.Guilds,
    },
    // THIS WILL BASICALLY BE YOUR HANDLER FOR YOUR EVENTS.
    handleDiscordPayload: async (shard, data) => {
      console.log('owo there is data here', shard.id, data.t);
    },
  });

  gateway.prepareBuckets();

  const startWorker = async (
    workerId: number,

    firstShardId: number,
    lastShardId: number,
    bucketId: number,
  ) => {
    const worker = workers.get(workerId);
    if (!worker) return;

    console.log(bucketId);

    worker.postMessage(
      JSON.stringify({
        type: 'IDENTIFY',
        shardId: firstShardId,
        shardsRecommended: results.shards,
        sessionStartLimitTotal: results.sessionStartLimit.total,
        sessionStartLimitRemaining: results.sessionStartLimit.remaining,
        sessionStartLimitResetAfter: results.sessionStartLimit.resetAfter,
        maxConcurrency: results.sessionStartLimit.maxConcurrency,
        lastShardId,
        workerId,
        gatewayBot: gateway.gatewayBot,
      }),
    );
  };

  gateway.buckets.forEach((bucket, bucketId) => {
    for (let i = 0; i < bucket.workers.length; i++) {
      const workerId = bucket.workers[i].id;
      const worker = new Worker('./dist/worker.js', { env: process.env });

      workers.set(workerId, worker);

      worker.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.type === 'BROADCAST_EVENT') {
          server.broadcast(JSON.stringify(data.data));
        }
      });

      if (bucket.workers[i + 1]) {
        worker.on('message', (msg) => {
          const data = JSON.parse(msg);
          if (data.type === 'ALL_SHARDS_READY') {
            const queue = bucket.workers[i + 1];
            if (queue) {
              startWorker(queue.id, queue.id, queue.queue[queue.queue.length - 1], bucketId);
            }
          }
        });
      }
    }

    const queue = bucket.workers[0];
    startWorker(queue.id, queue.id, queue.queue[queue.queue.length - 1], bucketId);
  });
}

client.on('ready', () => {
  console.log('[GATEWAY] REST IPC connected');

  startGateway();
});
