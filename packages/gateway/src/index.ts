/* eslint-disable no-console */
import { Client, Connection, Server } from 'net-ipc';
import { Collection, createGatewayManager, GatewayManager, Intents, routes } from 'discordeno';

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

        console.log(`[GATEWAY] Fail when reconnecting... ${retries} retries`);

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
let gatewayManager: GatewayManager;

const createWorker = (workerId: number) => {
  const workerData = {
    intents: Intents.Guilds,
    token: DISCORD_TOKEN,
    totalShards: gatewayManager.manager.totalShards,
    workerId,
  };

  const worker = new Worker('./dist/worker.js', { env: process.env, workerData });

  worker.on('message', async (data) => {
    switch (data.type) {
      case 'REQUEST_IDENTIFY': {
        await gatewayManager.manager.requestIdentify(data.shardId);

        const allowIdentify = {
          type: 'ALLOW_IDENTIFY',
          shardId: data.shardId,
        };

        worker.postMessage(allowIdentify);
        break;
      }
      case 'BROADCAST_EVENT':
        eventsServer.broadcast(data.data);
        break;
    }
  });

  return worker;
};

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

  gatewayManager = createGatewayManager({
    gatewayBot: results,
    gatewayConfig: {
      token: DISCORD_TOKEN,
      intents: Intents.Guilds,
    },
    totalShards,
    shardsPerWorker: Math.ceil(totalShards / workersAmount),
    totalWorkers: workersAmount,
    handleDiscordPayload: () => null,
    tellWorkerToIdentify: async (_, workerId, shardId) => {
      let worker = workers.get(workerId);

      if (!worker) {
        worker = createWorker(workerId);
        workers.set(workerId, worker);
      }

      const identify = {
        type: 'IDENTIFY_SHARD',
        shardId,
      };

      worker.postMessage(identify);
    },
  });

  gatewayManager.spawnShards();
}

restClient.on('ready', () => {
  console.log('[GATEWAY] REST IPC connected');
  restClient.send({ type: 'IDENTIFY', package: 'GATEWAY', id: '0' });

  if (gatewayOn) return;
  gatewayOn = true;

  startGateway();
});
