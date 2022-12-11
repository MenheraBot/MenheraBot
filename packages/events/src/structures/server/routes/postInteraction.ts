import { DiscordInteraction } from 'discordeno/types';
import { Context } from 'koa';
import Router from 'koa-router';
import { bot } from '../../../index';
import { verifyDiscordRequests } from '../middlewares/verifyDiscordRequests';

const handleRequest = async (ctx: Context): Promise<void> => {
  if (ctx.request.body.type === 1) {
    ctx.status = 200;
    ctx.body = { type: 1 };
    return;
  }

  ctx.respond = false;

  bot.events.interactionCreate(
    bot,
    bot.transformers.interaction(bot, ctx.request.body as DiscordInteraction),
  );
};

const createPostInteractionRouter = (): Router => {
  const router = new Router();
  router.post('/interactions', verifyDiscordRequests, (ctx) => handleRequest(ctx));
  return router;
};

export { createPostInteractionRouter };
