import Router from 'koa-router';
import { HTTPResponseCodes } from 'discordeno/types';
import { RequestType, sendEvent } from '../..';

export interface PrometheusResponse {
  contentType: string;
  data: string;
}

const createPrometheusRouter = (): Router => {
  const router = new Router();

  router.all('/metrics', async (ctx) => {
    const results = (await sendEvent(RequestType.Prometheus, null)) as PrometheusResponse | null;

    if (results === null) {
      ctx.status = HTTPResponseCodes.NotFound;
      return;
    }

    ctx.set('Content-Type', results.contentType);
    ctx.body = results.data;
  });

  return router;
};

export { createPrometheusRouter };
