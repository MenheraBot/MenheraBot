import Router from 'koa-router';
import { RequestType, sendEvent } from '../..';

const createPrometheusRouter = (): Router => {
  const router = new Router();

  router.all('/metrics', async (ctx) => {
    const results = (await sendEvent(RequestType.Prometheus, null)) as {
      contentType: string;
      data: string;
    };

    ctx.set('Content-Type', results.contentType);
    ctx.body = results.data;
  });

  return router;
};

export { createPrometheusRouter };
