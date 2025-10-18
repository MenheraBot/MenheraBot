import { Context } from 'koa';
import Router from '@koa/router';
import { RequestType, sendEvent } from '../../index.js';
import { HTTPResponseCodes } from '../httpServer.js';

const handleRequest = async (ctx: Context): Promise<void> => {
  if (!ctx.req.headers.authorization) return ctx.throw(HTTPResponseCodes.Unauthorized);

  ctx.status = HTTPResponseCodes.Ok;

  sendEvent(RequestType.UpdateCommands, { token: ctx.req.headers.authorization });
};

const createRequestCommandsRouter = (): Router => {
  const router = new Router();
  router.get('/commands', handleRequest);
  return router;
};

export { createRequestCommandsRouter };
