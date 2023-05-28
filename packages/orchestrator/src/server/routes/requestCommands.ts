import { Context } from 'koa';
import Router from 'koa-router';
import { RequestType, sendEvent } from '../..';

const handleRequest = async (ctx: Context): Promise<void> => {
  if (!ctx.req.headers.authorization) return ctx.throw(401);

  ctx.status = 200;

  sendEvent(RequestType.UpdateCommands, { token: ctx.req.headers.authorization });
};

const createRequestCommandsRouter = (): Router => {
  const router = new Router();
  router.get('/commands', (ctx) => handleRequest(ctx));
  return router;
};

export { createRequestCommandsRouter };
