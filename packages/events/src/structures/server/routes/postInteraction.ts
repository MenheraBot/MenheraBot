import { DiscordInteraction } from 'discordeno/types';
import { Context } from 'koa';
import Router from 'koa-router';
import { bot } from '../../../index';
import { verifyDiscordRequests } from '../middlewares/verifyDiscordRequests';
import { getInteractionsCounter } from '../../initializePrometheus';

const numberTypeToName = {
  1: 'PING',
  2: 'APPLICATION_COMMAND',
  3: 'MESSAGE_COMPONENT',
  4: 'APPLICATION_COMMAND_AUTOCOMPLETE',
  5: 'MODAL_SUBMIT',
};

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

  getInteractionsCounter().inc({
    type: numberTypeToName[ctx.request.body.type as 1],
  });
};

const createPostInteractionRouter = (): Router => {
  const router = new Router();
  router.post('/interactions', verifyDiscordRequests, (ctx) => handleRequest(ctx));
  return router;
};

export { createPostInteractionRouter };
