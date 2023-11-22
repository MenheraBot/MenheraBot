import { Context } from 'koa';
import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { RequestType, sendEvent } from '../..';
import { getEnviroments } from '../../getEnviroments';

const { MENHERA_API_TOKEN } = getEnviroments(['MENHERA_API_TOKEN']);

const handleRequest = async (ctx: Context): Promise<void> => {
  if (!ctx.req.headers.authorization) return ctx.throw(HTTPResponseCodes.Unauthorized);

  if (ctx.req.headers.authorization !== MENHERA_API_TOKEN)
    return ctx.throw(HTTPResponseCodes.Forbidden);

  const { users } = ctx.request.query;

  if (!users || !Array.isArray(users))
    return ctx.throw(HTTPResponseCodes.BadRequest, {
      message: 'Users should be an array of user ids in query string',
    });

  const result = await sendEvent(RequestType.TellMeUsers, { users });

  if (!result) return ctx.throw(HTTPResponseCodes.GatewayUnavailable);

  if ((result as unknown[]).length === 0) return ctx.throw(HTTPResponseCodes.NotFound);

  ctx.set('Content-Type', 'application/json');
  ctx.body = result;
  ctx.status = HTTPResponseCodes.Ok;
};

const createRequestUserDataRouter = (): Router => {
  const router = new Router();
  router.get('/users', handleRequest);
  return router;
};

export { createRequestUserDataRouter };
