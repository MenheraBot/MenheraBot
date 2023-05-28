import { Context } from 'koa';
import Router from 'koa-router';
import { RequestType, sendEvent } from '../..';
import { verifyDiscordRequests } from '../middlewares/verifyDiscordRequests';

const handleRequest = async (ctx: Context): Promise<void> => {
  if (ctx.request.body.type === 1) {
    ctx.status = 200;
    ctx.body = { type: 1 };
    return;
  }

  ctx.respond = false;

  sendEvent(RequestType.InteractionCreate, { body: ctx.request.body });
};

const createPostInteractionRouter = (): Router => {
  const router = new Router();
  router.post('/interactions', verifyDiscordRequests, (ctx) => handleRequest(ctx));
  return router;
};

export { createPostInteractionRouter };
