/* eslint-disable no-console */
import { Server } from 'net-ipc';
import { ConnectionInfo, IpcRequest } from 'types';
import handleRequest from './handleRequest';
import config from './config';

const { SOCKET_PATH } = config(['SOCKET_PATH']);

const connections: ConnectionInfo[] = [];

const server = new Server({
  path: SOCKET_PATH,
});

server.on('error', console.error);

server.on('ready', (add) => {
  console.log(`[SERVER] Server started on ${add}`);
});

server.on('connect', () => {
  console.log(`[IPC] New connection! Waiting for identification...`);
});

server.on('disconnect', (conn) => {
  const identified = connections.find((a) => a.internalId === conn.id);

  if (identified) {
    identified.connectedAt = -1;
    identified.disconnectedAt = Date.now();
    identified.connected = false;
    console.log(`[IPC] Client ${identified.package} - ${identified.id} disconnected`);
    return;
  }

  console.log(`[IPC] Unidentified client disconnected`);
});

server.on('message', (info: { id: string; package: string }, connection) => {
  const isReconnect = connections.find((a) => a.id === info.id && a.package === info.package);

  if (isReconnect) {
    isReconnect.internalId = connection.id;
    isReconnect.connectedAt = Date.now();
    isReconnect.disconnectedAt = -1;
    isReconnect.connected = true;
  } else
    connections.push({
      id: info.id,
      connected: true,
      connectedAt: Date.now(),
      disconnectedAt: -1,
      internalId: connection.id,
      package: info.package,
    });

  console.log(`[IPC] Connection identified! ${info.package} - ${info.id}`);
});

server.on('request', async (req: IpcRequest, res) => {
  res(await handleRequest(req));
});

const panic = (err: Error) => {
  console.error(err);
  process.exit(1);
};

server.start().catch(panic);
