import { Context } from 'koa';
import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import qs from 'qs';
import { RequestType, sendEvent } from '../..';
import { getEnviroments } from '../../getEnviroments';

const { MENHERA_API_TOKEN } = getEnviroments(['MENHERA_API_TOKEN']);

const handleRequest = async (ctx: Context): Promise<void> => {
  if (!ctx.req.headers.authorization) return ctx.throw(HTTPResponseCodes.Unauthorized);

  if (ctx.req.headers.authorization !== MENHERA_API_TOKEN)
    return ctx.throw(HTTPResponseCodes.Forbidden);

  if (!ctx.request.querystring)
    return ctx.throw(HTTPResponseCodes.BadRequest, {
      message: 'You need to send the users array in the query string',
    });

  const { users } = qs.parse(ctx.request.querystring);

  if (!users || !Array.isArray(users))
    return ctx.throw(HTTPResponseCodes.BadRequest, {
      message: 'Users should be an array of user ids in query string',
    });

  const result = await sendEvent(RequestType.TellMeUsers, { users });

  if (!result) {
    ctx.status = 503;
    ctx.body = "Menhera can't respond right now. I think she's sleeping hehehe";
    return;
  }

  if ((result as unknown[]).length === 0) return ctx.throw(HTTPResponseCodes.NotFound);

  ctx.body = result;
  ctx.status = HTTPResponseCodes.Ok;
};

const createRequestUserDataRouter = (): Router => {
  const router = new Router();
  router.get('/users', handleRequest);
  return router;
};

export { createRequestUserDataRouter };
