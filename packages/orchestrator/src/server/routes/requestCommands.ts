import { Context } from 'koa';
import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { RequestType, sendEvent } from '../..';

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
