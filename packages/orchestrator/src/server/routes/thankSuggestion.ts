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

  if (!ctx.request.body)
    return ctx.throw(HTTPResponseCodes.BadRequest, {
      message: 'You need to send the userId in the body',
    });

  const { userId } = ctx.request.body;

  if (!userId || typeof userId !== 'string')
    return ctx.throw(HTTPResponseCodes.BadRequest, {
      message: 'userId should be a string',
    });

  await sendEvent(RequestType.ThankSuggestion, { userId });

  ctx.status = HTTPResponseCodes.Ok;
};

const createThankSuggestionRouter = (): Router => {
  const router = new Router();
  router.post('/suggestion', handleRequest);
  return router;
};

export { createThankSuggestionRouter };
