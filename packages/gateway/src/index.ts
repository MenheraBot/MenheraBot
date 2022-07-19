import { Client } from 'net-ipc';
import { Collection, createGatewayManager, Intents, routes } from 'discordeno';

import { Worker } from 'cluster';

import config from './config';
import restRequest from './restRequest';

const { DISCORD_TOKEN, REST_AUTHORIZATION } = config();

const client = new Client({ path: '/run/menhera.sock' });
client.connect().catch(console.error);

const results = restRequest(client, {
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
  gatewayBot: results.then((res) => res) as any,
  gatewayConfig: {
    token: DISCORD_TOKEN,
    intents: Intents.Guilds,
  },
  // THIS WILL BASICALLY BE YOUR HANDLER FOR YOUR EVENTS.
  handleDiscordPayload: async (shard, data) => {
    console.log(shard, data);
  },
});

const workers = new Collection<number, Worker>();

async function startGateway() {
  gateway.prepareBuckets();

  function startWorker(
    workerId: number,
    bucketId: number,
    firstShardId: number,
    lastShardId: number,
  ) {
    const worker = workers.get(workerId);
    if (!worker) return;

    // TRIGGER IDENTIFY IN WORKER
    /*  worker.postMessage(
      JSON.stringify({
        type: 'IDENTIFY',
        shardId: firstShardId,
        shardsRecommended: results.shards,
        sessionStartLimitTotal: results.sessionStartLimit.total,
        sessionStartLimitRemaining: results.sessionStartLimit.remaining,
        sessionStartLimitResetAfter: results.sessionStartLimit.resetAfter,
        maxConcurrency: results.sessionStartLimit.maxConcurrency,
        lastShardId: lastShardId,
        workerId,
      }),
    ); */
  }

  gateway.buckets.forEach((bucket, bucketId) => {
    for (let i = 0; i < bucket.workers.length; i++) {
      const workerId = bucket.workers[i].id;
      const worker = new Worker();

      workers.set(workerId, worker);

      if (bucket.workers[i + 1]) {
        /* worker.onmessage = function (message: { data: string }) {
          const data = JSON.parse(message.data);
          if (data.type === 'ALL_SHARDS_READY') {
            const queue = bucket.workers[i + 1];
            if (queue) {
              startWorker(queue.id, bucketId, queue.id, queue.queue[queue.queue.length - 1]);
            }
          }
        }; */
      }
    }

    const queue = bucket.workers[0];
    startWorker(queue.id, bucketId, queue.id, queue.queue[queue.queue.length - 1]);
  });
}

startGateway();
