import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { RequestType, sendEvent } from '../../index.js';
import { getEnviroments } from '../../getEnviroments.js';

const createVoteWebhookRouter = (): Router => {
  const router = new Router();

  const { DBL_TOKEN } = getEnviroments(['DBL_TOKEN']);

  router.post('/webhook', (ctx) => {
    if (!ctx.req.headers.authorization) return ctx.throw(HTTPResponseCodes.Unauthorized);

    if (ctx.req.headers.authorization !== DBL_TOKEN) return ctx.throw(HTTPResponseCodes.Forbidden);

    const { user, isWeekend, type } = ctx.request.body;

    ctx.status = HTTPResponseCodes.Ok;

    if (type === 'test') return;

    sendEvent(RequestType.VoteWebhook, { user, isWeekend });
  });

  return router;
};

export { createVoteWebhookRouter };
