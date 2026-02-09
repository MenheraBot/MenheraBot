import Router from '@koa/router';
import { Context } from 'koa';
import { HTTPResponseCodes } from '../httpServer.js';
import { closeConnections } from '../../index.js';

const handleRequest = async (ctx: Context): Promise<void> => {
  ctx.status = HTTPResponseCodes.Accepted;

  closeConnections()
};

const createRebootRoute = (): Router => {
  const router = new Router();
  router.post('/dev/reboot', handleRequest);
  return router;
};

export { createRebootRoute };
