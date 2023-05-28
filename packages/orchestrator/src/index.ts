/* eslint-disable no-console */
import { Connection, Server } from 'net-ipc';

if (!process.env.ORCHESTRATOR_SOCKET_PATH)
  throw new Error('The ORCHESTRATOR_SOCKET_PATH enviroment variable is not present');

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

const connectedClients: EventClientConnection[] = [];

orchestratorServer.on('message', async (msg, conn) => {
  if (msg.type === 'IDENTIFY') {
    if (!currentVersion) currentVersion = msg.version;

    if (currentVersion === msg.version) {
      connectedClients.push({
        id: conn.id,
        conn,
        version: msg.version,
        isMaster: false,
      });

      if (connectedClients.length === 1) {
        await conn.request({ type: 'YOU_ARE_THE_MASTER' });
        connectedClients[0].isMaster = true;
      }

      return;
    }

    if (swappingVersions)
      return waitingForSwap.push({ id: conn.id, conn, version: msg.version, isMaster: false });

    swappingVersions = true;

    connectedClients.map((a) => a.conn.request({ type: 'YOU_MAY_REST' }));

    await new Promise((resolve) => {
      finishSwap = resolve;
    });

    swappingVersions = false;
    currentVersion = msg.version;

    connectedClients.push({ id: conn.id, conn, version: msg.version, isMaster: true });

    await conn.request({ type: 'YOU_ARE_THE_MASTER' });

    waitingForSwap.forEach((c) => connectedClients.push(c));

    waitingForSwap = [];
  }
});

orchestratorServer.on('disconnect', (conn) => {
  const eventClient = connectedClients.find((a) => a.id === conn.id);

  connectedClients.splice(
    connectedClients.findIndex((c) => c.id === conn.id),
    1,
  );

  if (swappingVersions) {
    if (connectedClients.length === 0) finishSwap();
    return;
  }

  if (connectedClients.length === 0) return;

  if (eventClient?.isMaster) {
    connectedClients[0].conn.request({ type: 'YOU_ARE_THE_MASTER' });
    connectedClients[0].isMaster = true;
  }
});

orchestratorServer.on('ready', () => {
  console.log('[ORCHESTRATOR] The service has been started');
});

orchestratorServer.start().catch((r) => {
  console.error(r);
  process.exit(1);
});
