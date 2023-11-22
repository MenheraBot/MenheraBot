import { Context } from 'koa';
import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { RequestType, sendEvent } from '../..';
import { verifyDiscordRequests } from '../middlewares/verifyDiscordRequests';

const handleRequest = async (ctx: Context): Promise<void> => {
  if (ctx.request.body.type === 1) {
    ctx.status = HTTPResponseCodes.Ok;
    ctx.body = { type: 1 };
    return;
  }

  const response = await sendEvent(RequestType.InteractionCreate, { body: ctx.request.body });

  if (!response) {
    ctx.status = 500;
    return;
  }

  ctx.body = response;
  ctx.status = HTTPResponseCodes.Ok;
};

const createPostInteractionRouter = (): Router => {
  const router = new Router();
  router.post('/interactions', verifyDiscordRequests, handleRequest);
  return router;
};

export { createPostInteractionRouter };
