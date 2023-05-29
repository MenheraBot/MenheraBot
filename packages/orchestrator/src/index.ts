/* eslint-disable no-console */
import { DiscordInteraction } from 'discordeno/*';
import { Connection, PromiseSettled, Server } from 'net-ipc';
import { mergeMetrics } from './prometheusWorkarround';
import { respondInteraction } from './respondInteraction';
import { createHttpServer, registerAllRouters } from './server/httpServer';

if (!process.env.ORCHESTRATOR_SOCKET_PATH)
  throw new Error('ORCHESTRATOR_SOCKET_PATH is not in the env variables');

const orchestratorServer = new Server({ path: process.env.ORCHESTRATOR_SOCKET_PATH });

type EventClientConnection = {
  id: string;
  conn: Connection;
  isMaster: boolean;
  version: string;
};

let currentVersion: string;
let swappingVersions = false;
let finishSwap: (..._: unknown[]) => void;
let waitingForSwap: EventClientConnection[] = [];
let eventsCounter = 0;

let connectedClients: EventClientConnection[] = [];

export enum RequestType {
  VoteWebhook = 'VOTE_WEBHOOK',
  InteractionCreate = 'INTERACTION_CREATE',
  Prometheus = 'PROMETHEUS',
  UpdateCommands = 'UPDATE_COMMANDS',
  YouAreTheMaster = 'YOU_ARE_THE_MASTER',
  YouMayRest = 'YOU_MAY_REST',
}

const sendEvent = async (type: RequestType, data: unknown): Promise<unknown> => {
  eventsCounter += 1;
  if (eventsCounter >= 25) eventsCounter = 0;

  const clientsToUse = swappingVersions ? waitingForSwap : connectedClients;

  if (clientsToUse.length === 0) {
    if (type === RequestType.InteractionCreate)
      return respondInteraction((data as { body: DiscordInteraction }).body);

    return null;
  }

  const toUseClient = clientsToUse[eventsCounter % clientsToUse.length];

  if (type !== RequestType.Prometheus) {
    toUseClient.conn.send({ type, data });
    return;
  }

  const results = (await orchestratorServer
    .survey({ type: RequestType.Prometheus })
    .catch(console.error)) as void | PromiseSettled[];

  if (!results) return null;

  return mergeMetrics(
    results.filter((a) => a.status === 'fulfilled').map((a) => a.value),
    connectedClients.length,
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

    connectedClients.map((a) => a.conn.request({ type: RequestType.YouMayRest }));

    await new Promise((resolve) => {
      finishSwap = resolve;
    });

    console.log(`[SWAP VERSION] All old clients shut down`);

    swappingVersions = false;
    currentVersion = msg.version;

    connectedClients = waitingForSwap;
    waitingForSwap = [];

    await conn.request({ type: RequestType.YouAreTheMaster });
    console.log(`[CLIENT] Master Set!`);
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
      finishSwap();
      console.log(
        `[DISCONNECT] This last client was the last one to swap versions. Finishing the swap`,
      );
    }
    return;
  }

  if (connectedClients.length === 0) {
    console.log(`[DISCONNECT] There are no client to be setted as the mastert now`);
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
});

orchestratorServer.start().catch((r) => {
  console.error(r);
  process.exit(1);
});

export { sendEvent };
