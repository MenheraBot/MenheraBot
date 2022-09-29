/* eslint-disable no-console */
import { Server } from 'net-ipc';
import { ConnectionInfo, IpcRequest, MessageTypes } from 'types';
import { handleIdentify } from 'ipcMessages';
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

server.on('message', (info: MessageTypes, connection) => {
  if (info.type === 'IDENTIFY') return handleIdentify(connections, info, connection);
});

server.on('request', async (req: IpcRequest, res) => {
  res(await handleRequest(req));
});

const panic = (err: Error) => {
  console.error(err);
  process.exit(1);
};

server.start().catch(panic);
