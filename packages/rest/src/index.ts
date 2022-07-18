import handleRequest from 'handleRequest';
import { Server } from 'net-ipc';
import { IpcRequest } from 'types';

const server = new Server({
  path: '/run/menhera.sock',
});

server.on('request', async (req: IpcRequest, res) => {
  res(await handleRequest(req));
});

server.start().catch(console.error);
