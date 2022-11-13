/* eslint-disable no-console */
import { Client, Connection, Server } from 'net-ipc';
import { Collection, createGatewayManager, Intents, routes } from 'discordeno';

import { Worker } from 'worker_threads';

import os from 'node:os';

import config from './config';

const { DISCORD_TOKEN, REST_AUTHORIZATION, REST_SOCKET_PATH, EVENT_HANDLER_SOCKET_PATH } = config([
  'DISCORD_TOKEN',
  'REST_AUTHORIZATION',
  'REST_SOCKET_PATH',
  'EVENT_HANDLER_SOCKET_PATH',
]);

const restClient = new Client({ path: REST_SOCKET_PATH });
const eventsServer = new Server({ path: EVENT_HANDLER_SOCKET_PATH });

let reconnectInterval: NodeJS.Timeout;
let retries = 0;
let gatewayOn = false;

restClient.on('close', () => {
  console.log('[GATEWAY] REST Client closed');

  const reconnectLogic = () => {
    console.log('[GATEWAY] Trying to reconnect to REST Client');
    restClient
      .connect()
      .catch(() => {
        setTimeout(reconnectLogic, 5000);

        console.log(`[GATEWAY] Fail when reconnecting... ${retries} tries`);

        if (retries >= 3) {
          console.log(`[GATEWAY] Couldn't reconnect to REST client.`);
          process.exit(1);
        }

        retries += 1;
      })
      .then(() => {
        clearTimeout(reconnectInterval);
        retries = 0;
      });
  };

  setTimeout(reconnectLogic, 5000);
});

type EventClientConnection = {
  id: string;
  conn: Connection;
  version: string;
};

const eventClientConnections: EventClientConnection[] = [];

eventsServer.on('message', (msg, conn) => {
  if (msg.type === 'IDENTIFY')
    eventClientConnections.push({ id: conn.id, conn, version: msg.version });
});

eventsServer.on('disconnect', (conn) => {
  eventClientConnections.splice(
    eventClientConnections.findIndex((c) => c.id === conn.id),
    1,
  );
});

eventsServer.on('ready', () => {
  console.log('[GATEWAY] Event Handler Server started');
});

const panic = (err: Error) => {
  console.error(err);
  process.exit(1);
};

restClient.connect().catch(panic);
eventsServer.start().catch(panic);

const workers = new Collection<number, Worker>();

async function startGateway() {
  const results = await restClient
    .request({
      type: 'RUN_METHOD',
      data: {
        Authorization: REST_AUTHORIZATION,
        body: undefined,
        method: 'GET',
        url: routes.GATEWAY_BOT(),
      },
    })
    .then((res) => ({
      url: res.url,
      shards: res.shards,
      sessionStartLimit: {
        total: res.session_start_limit.total,
        remaining: res.session_start_limit.remaining,
        resetAfter: res.session_start_limit.reset_after,
        maxConcurrency: res.session_start_limit.max_concurrency,
      },
    }));

  const workersAmount = os.cpus().length;
  const totalShards = results.shards;

  const gateway = createGatewayManager({
    gatewayBot: results,
    gatewayConfig: {
      token: DISCORD_TOKEN,
      intents: Intents.Guilds,
    },
    totalShards,
    shardsPerWorker: Math.ceil(totalShards / workersAmount),
    totalWorkers: workersAmount,
    handleDiscordPayload: () => null,
  });

  gateway.prepareBuckets();

  const startWorker = async (workerId: number, firstShardId: number, lastShardId: number) => {
    const worker = workers.get(workerId);
    if (!worker) return;

    worker.postMessage({
      type: 'IDENTIFY',
      firstShardId,
      lastShardId,
      totalShards,
      workerId,
      gatewayBot: {
        ...gateway.gatewayBot,
        sessionStartLimit: {
          ...gateway.gatewayBot.sessionStartLimit,
          maxConcurrency: 1,
        },
      },
    });
  };

  gateway.buckets.forEach((bucket) => {
    for (let i = 0; i < bucket.workers.length; i++) {
      const workerId = bucket.workers[i].id;
      const worker = new Worker('./dist/worker.js', { env: process.env });

      workers.set(workerId, worker);

      worker.on('message', (msg) => {
        // Create events queue to check if events client is up! If not, retry up to the third second of interaction
        // The events client should send a message in soft restart. If this message is received, store the events in a quee
        // If its not a soft restart, reply the interaction with an custom error message that tells users that menhera
        // Is current offline

        // Maybe change from broadcast to request, and waits to the events client to respond the request within 1 second
        // the events client should check the event creation timestamp, if it is more than 1 second, it should ignore
        // that event, and wait for another request of the gateway client
        // The event client should respond to the gateway client with an ok message, so the gateway client dont put the event
        // in a queue to resend it.
        if (msg.type === 'BROADCAST_EVENT') eventsServer.broadcast(msg.data);
      });

      if (bucket.workers[i + 1]) {
        worker.on('message', (msg) => {
          if (msg.type === 'ALL_SHARDS_READY') {
            const queue = bucket.workers[i + 1];
            if (queue) {
              console.log(`[GATEWAY] Starting worker ${queue.id}`);
              startWorker(queue.id, queue.queue[0], queue.queue[queue.queue.length - 1]);
            }
          }
        });
      }
    }

    const queue = bucket.workers[0];
    console.log(`[GATEWAY] Starting worker ${queue.id}`);
    startWorker(queue.id, queue.queue[0], queue.queue[queue.queue.length - 1]);
  });
}

restClient.on('ready', () => {
  console.log('[GATEWAY] REST IPC connected');
  restClient.send({ type: 'IDENTIFY', package: 'GATEWAY', id: '0' });

  if (gatewayOn) return;
  gatewayOn = true;

  startGateway();
});
