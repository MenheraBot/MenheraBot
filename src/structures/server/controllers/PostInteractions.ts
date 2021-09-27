/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Context } from 'koa';
import Router from 'koa-router';
import MenheraClient from 'MenheraClient';
import authenticateDsicordRequests from '../middlewares/authenticateDsicordRequests';

const handleRequest = (ctx: Context, client: MenheraClient) => {
  if (ctx.request.body.type === 1) {
    ctx.status = 200;
    ctx.body = { type: 1 };
    return;
  }
  // @ts-ignore
  client.actions.InteractionCreate.handle(ctx.request.body);
};

export default (client: MenheraClient): Router => {
  const router = new Router();
  router.post('/interactions', authenticateDsicordRequests, (ctx) => handleRequest(ctx, client));
  return router;
};
