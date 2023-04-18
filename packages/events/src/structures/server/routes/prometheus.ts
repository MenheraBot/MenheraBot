import Router from 'koa-router';
import { getRegister } from '../../initializePrometheus';

const createPrometheusRouter = (): Router => {
  const router = new Router();

  router.all('/metrics', async (ctx) => {
    const register = getRegister();

    ctx.set('Content-Type', register.contentType);
    ctx.body = await register.metrics();
  });

  return router;
};

export { createPrometheusRouter };
