import { Server } from 'net-ipc';
import config from './config.js';
import { handleRequest } from './handleRequest.js';
import { handleIdentify } from './ipcMessages.js';
import { ConnectionInfo, IdentifyMessage, RequestTypes } from './types.js';

const { SOCKET_PATH } = config(['SOCKET_PATH']);

const connections: ConnectionInfo[] = [];

const server = new Server({
  path: SOCKET_PATH,
});

server.on('error', console.error);

server.on('ready', (add) => {
  console.log(`[SERVER] Server started on ${add}`);
});

server.on('disconnect', (conn, reason) => {
  if (!reason || reason === 'REQUESTED_SHUTDOWN') {
    const identified = connections.find((a) => a.internalId === conn.id);

    if (!identified) return;

    console.log(
      `[IPC] Client ${identified.internalId} ${
        reason ? 'is going to sleep' : 'was brutally disconnected!'
      }`,
    );

    const connIndex = connections.findIndex((c) => c.internalId === conn.id);
    if (connIndex > -1) connections.splice(connIndex, 1);
    return;
  }

  const identified = connections.find((a) => a.internalId === conn.id);

  if (identified) {
    identified.connectedAt = -1;
    identified.disconnectedAt = Date.now();
    identified.connected = false;
    console.log(`[IPC] Client ${identified.internalId} disconnected`);
    return;
  }

  console.log(`[IPC] Unidentified client disconnected`);
});

server.on('message', (info: IdentifyMessage, connection) => {
  if (info.type === 'IDENTIFY') return handleIdentify(connections, connection);
});

server.on('request', async (req: RequestTypes, res) => {
  res(await handleRequest(req));
});

const panic = (err: Error) => {
  console.error(err);
  process.exit(1);
};

server.start().catch(panic);
