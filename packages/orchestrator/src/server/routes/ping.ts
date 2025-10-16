import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { Context } from 'koa';
import { RequestType, sendEvent } from '../../index.js';

const handleRequest = async (ctx: Context): Promise<void> => {
  ctx.status = HTTPResponseCodes.Ok;

  if (ctx.req.method === 'HEAD') {
    ctx.body = null;
    ctx.status = 200;
    ctx.set('Content-Type', 'application/json');
    return;
  }

  const pings = await sendEvent(RequestType.AreYouOk, Date.now());

  ctx.body = {
    orchestrator: {
      uptime: Math.floor(process.uptime() * 1000),
    },
    events: pings ?? [],
  };
};

const createPingRouter = (): Router => {
  const router = new Router();
  router.head('/ping', handleRequest);
  router.get('/ping', handleRequest);
  return router;
};

export { createPingRouter };
