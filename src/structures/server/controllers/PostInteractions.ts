/* eslint-disable no-bitwise */
import { Context } from 'koa';
import Router from 'koa-router';
import MenheraClient from 'MenheraClient';
import authenticateDiscordRequests from '../middlewares/authenticateDiscordRequests';

const handleRequest = async (ctx: Context, client: MenheraClient) => {
  if (ctx.request.body.type === 1) {
    ctx.status = 200;
    ctx.body = { type: 1 };
    return;
  }

  if (typeof ctx.request.body.guild_id === 'undefined') {
    ctx.status = 200;
    ctx.body = {
      type: 4,
      data: {
        content: 'Comandos devem ser usados em servidores!\n\nCommands must be used in servers',
        flags: 1 << 6,
      },
    };
    return;
  }

  // @ts-expect-error Actions is private
  client.actions.InteractionCreate.handle(ctx.request.body);

  ctx.respond = false;
};

export default (client: MenheraClient): Router => {
  const router = new Router();
  router.post('/interactions', authenticateDiscordRequests, (ctx) => handleRequest(ctx, client));
  return router;
};
