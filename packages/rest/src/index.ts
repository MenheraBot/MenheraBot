import handleRequest from 'handleRequest';
import { Server } from 'net-ipc';

const server = new Server({
  path: '/run/menhera.sock',
});

server.on('request', async (req, res) => {
  res(await handleRequest(req));
});

server.start().catch(console.error);
