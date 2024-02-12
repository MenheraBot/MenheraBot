import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { RequestType, sendEvent } from '../..';
import { getEnviroments } from '../../getEnviroments';

const createVoteWebhookRouter = (): Router => {
  const router = new Router();

  const { DBL_TOKEN } = getEnviroments(['DBL_TOKEN']);

  router.post('/webhook', (ctx) => {
    if (!ctx.req.headers.authorization) return ctx.throw(HTTPResponseCodes.Unauthorized);

    if (ctx.req.headers.authorization !== DBL_TOKEN) return ctx.throw(HTTPResponseCodes.Forbidden);

    const { user, isWeekend, type } = ctx.request.body;

    ctx.status = HTTPResponseCodes.Ok;

    console.log('VOTE MESSAGE', ctx.request.body);

    if (type === 'test') return;

    sendEvent(RequestType.VoteWebhook, { user, isWeekend });
  });

  return router;
};

export { createVoteWebhookRouter };
