import Router from 'koa-router';
import { RequestType, sendEvent } from '../..';
import { getEnviroments } from '../../getEnviroments';

const createVoteWebhookRouter = (): Router => {
  const router = new Router();

  const { DBL_TOKEN } = getEnviroments(['DBL_TOKEN']);

  router.post('/webhook', (ctx) => {
    if (!ctx.req.headers.authorization || ctx.req.headers.authorization !== DBL_TOKEN)
      return ctx.throw(401, 'You are not allowed to access that!');

    const { user, isWeekend, type } = ctx.request.body;

    ctx.status = 200;

    if (type === 'test') return;

    sendEvent(RequestType.VoteWebhook, { user, isWeekend });
  });

  return router;
};

export { createVoteWebhookRouter };
