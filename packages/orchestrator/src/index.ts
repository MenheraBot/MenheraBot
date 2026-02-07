import { DiscordInteraction } from '@discordeno/types';
import { Connection, Server } from 'net-ipc';
import Koa from 'koa';
import { mergeMetrics } from './prometheusWorkarround.js';
import { respondDevInteraction, respondInteraction } from './respondInteraction.js';
import { createHttpServer, registerAllRouters } from './server/httpServer.js';
import { PrometheusResponse } from './server/routes/prometheus.js';
import { getEnviroments } from './getEnviroments.js';
import { Bot, logger } from '@discordeno/bot';

declare module 'koa' {
  interface Request extends Koa.BaseRequest {
    body?: any;
  }
}

const { ORCHESTRATOR_SOCKET_PATH } = getEnviroments(['ORCHESTRATOR_SOCKET_PATH']);

const orchestratorServer = new Server({ path: ORCHESTRATOR_SOCKET_PATH });

interface EventClientConnection {
  id: string;
  conn: Connection;
  isMaster: boolean;
  version: string;
}

let currentVersion: string;
let swappingVersions = false;
let finishSwap: (..._: unknown[]) => void;
let waitingForSwap: EventClientConnection[] = [];
let eventsCounter = 0;

let connectedClients: EventClientConnection[] = [];
let missedInteractions = 0;

export enum RequestType {
  VoteWebhook = 'VOTE_WEBHOOK',
  InteractionCreate = 'INTERACTION_CREATE',
  Prometheus = 'PROMETHEUS',
  UpdateCommands = 'UPDATE_COMMANDS',
  YouAreTheMaster = 'YOU_ARE_THE_MASTER',
  TellMeUsers = 'TELL_ME_USERS',
  YouMayRest = 'YOU_MAY_REST',
  SimonSays = 'SIMON_SAYS',
  AreYouOk = 'ARE_YOU_OK',
  ThankSuggestion = 'THANK_SUGGESTION',
}

const getVersion = () => currentVersion;

const sendEvent = async (type: RequestType, data: unknown, devBot?: Bot): Promise<unknown> => {
  eventsCounter += 1;
  if (eventsCounter >= 25) eventsCounter = 0;

  const clientsToUse = swappingVersions ? waitingForSwap : connectedClients;

  if (clientsToUse.length === 0) {
    if (type === RequestType.InteractionCreate) {
      missedInteractions += 1;
      logger.warn('[EVENT] Interaction lost due no clients connected');

      const interaction = (data as { body: DiscordInteraction }).body;

      if (process.env.NODE_ENV === 'development' && devBot)
        return respondDevInteraction(devBot, interaction);

      return respondInteraction(interaction);
    }

    return null;
  }

  const toUseClient = clientsToUse[eventsCounter % clientsToUse.length];

  if ([RequestType.TellMeUsers, RequestType.ThankSuggestion].includes(type)) {
    const result = await toUseClient.conn
      .request({ type, data })
      .catch((e) =>
        console.error(`Error sending request to client: ${e?.message ?? 'Unknown error'}`),
      );
    return result;
  }

  if (type === RequestType.AreYouOk) {
    const pings = await orchestratorServer.survey({ type: RequestType.AreYouOk }, 1000);
    return pings.map((p) =>
      p.status === 'fulfilled'
        ? {
            uptime: p.value,
            ping:
              Math.floor(Date.now() - (data as number)) > 0
                ? Math.floor(Date.now() - (data as number))
                : 0,
          }
        : { uptime: -1, ping: -1 },
    );
  }

  if (type !== RequestType.Prometheus) {
    const success = toUseClient.conn
      .send({ type, data })
      .catch((e) =>
        console.log(`Error seinding message to client: ${e?.message ?? 'Unknown error'}`),
      )
      .then(() => true);

    if (!success) return null;

    return [];
  }

  const results = await Promise.allSettled(
    clientsToUse.map((a) => a.conn.request({ type: RequestType.Prometheus })),
  );

  return mergeMetrics(
    results.reduce<PrometheusResponse[]>((p, c) => {
      if (c.status === 'rejected') return p;
      p.push(c.value);
      return p;
    }, []),
    connectedClients.length,
    missedInteractions,
  );
};

orchestratorServer.on('message', async (msg, conn) => {
  if (msg.type === 'IDENTIFY') {
    eventsCounter = 0;
    if (!currentVersion) currentVersion = msg.version;

    if (currentVersion === msg.version) {
      console.log(`[CONNECT] New connection on the current version ${msg.version}`);
      connectedClients.push({
        id: conn.id,
        conn,
        version: msg.version,
        isMaster: false,
      });

      if (connectedClients.length === 1) {
        await conn.request({ type: RequestType.YouAreTheMaster });
        console.log(`[CONNECT] Master Set!`);
        connectedClients[0].isMaster = true;
      }

      return;
    }

    waitingForSwap.push({ id: conn.id, conn, version: msg.version, isMaster: false });

    if (swappingVersions) {
      console.log(`[CONNECT] New connection waiting for the version swap! ${msg.version}`);
      return;
    }

    swappingVersions = true;

    console.log(
      `[SWAP VERSION] A new version has been released! Starting to swap the versions. Old version: ${currentVersion} | New Version: ${msg.version}`,
    );

    connectedClients.map((a) => a.conn.send({ type: RequestType.YouMayRest }));

    await new Promise((resolve) => {
      finishSwap = resolve;
    });

    console.log(`[SWAP VERSION] All old clients shut down`);

    swappingVersions = false;
    currentVersion = msg.version;

    connectedClients = waitingForSwap;
    waitingForSwap = [];

    if (typeof conn?.connection?.closed === 'undefined' || conn.connection.closed)
      return console.log('[CLIENT] The first version in swap is not connected anymore');

    await conn.request({ type: RequestType.YouAreTheMaster });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    connectedClients.find((a) => a.id === a.conn.id)!.isMaster = true;
    console.log(`[CLIENT] Master Set!`);
  }

  if (msg.type === 'BE_MERCURY') {
    const replayMessage = () => {
      if (swappingVersions)
        return setTimeout(() => {
          replayMessage();
        }, 2000);

      const master = connectedClients.find((a) => a.isMaster);

      if (!master)
        return setTimeout(() => {
          replayMessage();
        }, 1000);

      master.conn.send({
        type: RequestType.SimonSays,
        action: msg.action,
        timerId: msg.timerId,
        timerMetadata: msg.timerMetadata,
      });
    };

    replayMessage();
  }
});

orchestratorServer.on('disconnect', (conn) => {
  const eventClient = connectedClients.find((a) => a.id === conn.id);
  eventsCounter = 0;

  connectedClients.splice(
    connectedClients.findIndex((c) => c.id === conn.id),
    1,
  );

  console.log(
    `[DISCONNECT] A client in version ${eventClient?.version} lost connection. ${
      eventClient?.isMaster ? 'It was the master.' : ''
    }`,
  );

  if (swappingVersions) {
    if (connectedClients.length === 0) {
      console.log(
        `[DISCONNECT] This last client was the last one to swap versions. Finishing the swap`,
      );
      finishSwap();
    }
    return;
  }

  if (connectedClients.length === 0) {
    console.log(`[DISCONNECT] There are no client to be setted as the master now`);
    return;
  }

  if (eventClient?.isMaster) {
    connectedClients[0].conn.request({ type: RequestType.YouAreTheMaster });
    connectedClients[0].isMaster = true;
    console.log(`[CLIENT] Master Set!`);
  }
});

orchestratorServer.on('ready', () => {
  console.log('[ORCHESTRATOR] The service has been started');
  createHttpServer();
  registerAllRouters();

  if (process.env.DEVEL_DISCORD_TOKEN && process.env.NODE_ENV === 'development') {
    (async () => {
      const token = process.env.DEVEL_DISCORD_TOKEN;
      const discordeno = await import('@discordeno/bot');

      const bot = discordeno.createBot({
        token: `${token}`,
        desiredProperties: {},
      });

      const oldGatewayProcessing = bot.gateway.events.message;

      bot.gateway.events.message = (shard, p) => {
        if (p.op === 0 && p.t === 'INTERACTION_CREATE') {
          console.log('[EVENT] - Interaction created!');
          sendEvent(RequestType.InteractionCreate, { body: p.d, noAck: true }, bot as Bot);
        }
        oldGatewayProcessing?.(shard, p);
      };

      await bot.start();
    })();
  }
});

orchestratorServer.start().catch((r) => {
  console.error(r);
  process.exit(1);
});

export { sendEvent, getVersion };
