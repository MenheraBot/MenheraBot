import { Context } from 'koa';
import Router from 'koa-router';
import { getEnviroments } from '../../../utils/getEnviroments';
import { updateCommandsOnApi } from '../../../utils/updateApiCommands';

const { MENHERA_API_TOKEN } = getEnviroments(['MENHERA_API_TOKEN']);

const handleRequest = async (ctx: Context): Promise<void> => {
  if (!ctx.req.headers.authorization) return ctx.throw(401);

  if (ctx.req.headers.authorization !== MENHERA_API_TOKEN) return ctx.throw(403);

  ctx.status = 200;

  await updateCommandsOnApi();
};

const createRequestCommandsRouter = (): Router => {
  const router = new Router();
  router.get('/commands', (ctx) => handleRequest(ctx));
  return router;
};

export { createRequestCommandsRouter };
