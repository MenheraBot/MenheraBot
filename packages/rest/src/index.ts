/* eslint-disable no-console */
import { Server } from 'net-ipc';
import { IpcRequest } from 'types';
import handleRequest from './handleRequest';
import config from './config';

const { SOCKET_PATH } = config(['SOCKET_PATH']);

const server = new Server({
  path: SOCKET_PATH,
});

server.on('error', console.error);

server.on('ready', (add) => {
  console.log(`[REST] Server started on ${add}`);
});

server.on('connect', (conn) => {
  console.log(`[REST] Client ${conn.id} connected`);
});

server.on('disconnect', (conn) => {
  console.log(`[REST] Client ${conn.id} disconnected`);
});

server.on('request', async (req: IpcRequest, res) => {
  res(await handleRequest(req));
});

const panic = (err: Error) => {
  console.error(err);
  process.exit(1);
};

server.start().catch(panic);