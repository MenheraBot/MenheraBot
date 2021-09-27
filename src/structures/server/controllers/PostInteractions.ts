/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Context } from 'koa';
import Router from 'koa-router';
import MenheraClient from 'MenheraClient';
import { Client } from 'discord.js-light';
import authenticateDiscordRequests from '../middlewares/authenticateDiscordRequests';

const handleRequest = async (ctx: Context, client: MenheraClient) => {
  if (ctx.request.body.type === 1) {
    ctx.status = 200;
    ctx.body = { type: 1 };
    return;
  }

  const shardToExecute = Number(ctx.request.body.guildId) >> 22 % (client.shard?.count as number);
  await client.shard
    ?.broadcastEval(
      (c: Client, { data }: { data: unknown }) => {
        if (!c.isReady()) return;
        // @ts-ignore
        c.actions.InteractionCreate.handle(data);
      },
      {
        shard: shardToExecute,
        context: { data: ctx.request.body },
      },
    )
    .catch(() => null);
  ctx.respond = false;
};

export default (client: MenheraClient): Router => {
  const router = new Router();
  router.post('/interactions', authenticateDiscordRequests, (ctx) => handleRequest(ctx, client));
  return router;
};
