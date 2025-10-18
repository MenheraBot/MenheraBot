import { Context } from 'koa';
import Router from '@koa/router';
import { RequestType, sendEvent } from '../../index.js';
import { verifyDiscordRequests } from '../middlewares/verifyDiscordRequests.js';
import { HTTPResponseCodes } from '../httpServer.js';

const handleRequest = async (ctx: Context): Promise<void> => {
  if (ctx.request.body.type === 1) {
    ctx.status = HTTPResponseCodes.Ok;
    ctx.body = { type: 1 };
    return;
  }

  const response = (await sendEvent(RequestType.InteractionCreate, { body: ctx.request.body })) as {
    discord: unknown;
    id: string;
  };

  if (!response) {
    ctx.status = 500;
    return;
  }

  ctx.body = response.discord;
  ctx.status = HTTPResponseCodes.Ok;

  ctx.res.once('finish', () => {
    sendEvent(RequestType.AckInteractionResponse, { id: response.id });
  });
};

const createPostInteractionRouter = (): Router => {
  const router = new Router();
  router.post('/interactions', verifyDiscordRequests, handleRequest);
  return router;
};

export { createPostInteractionRouter };
