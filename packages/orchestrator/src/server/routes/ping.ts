import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { RequestType, sendEvent } from '../..';

const createPingRouter = (): Router => {
  const router = new Router();

  router.get('/ping', async (ctx) => {
    ctx.status = HTTPResponseCodes.Ok;

    const pings = await sendEvent(RequestType.AreYouOk, Date.now());

    ctx.body = {
      orchestrator: {
        uptime: Math.floor(process.uptime() * 1000),
      },
      events: pings ?? [],
    };
  });

  return router;
};

export { createPingRouter };
