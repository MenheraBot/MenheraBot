import Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import { logger } from '../../utils/logger';
import { getEnviroments } from '../../utils/getEnviroments';
import { createPostInteractionRouter } from './routes/postInteraction';
import { createVoteWebhookRouter } from './routes/voteWebhook';
import { createPrometheusRouter } from './routes/prometheus';

const server = new Koa();

const createHttpServer = (): void => {
  const { HTTP_SERVER_PORT } = getEnviroments(['HTTP_SERVER_PORT']);

  server.listen(HTTP_SERVER_PORT, () => {
    logger.info(`[HTTP] Server started at port ${HTTP_SERVER_PORT}`);
  });

  server.use(koaBody({ includeUnparsed: true }));
};

const registerRouter = (router: Router): void => {
  server.use(router.routes());
};

const registerAllRouters = (): void => {
  registerRouter(createPostInteractionRouter());
  registerRouter(createVoteWebhookRouter());
  registerRouter(createPrometheusRouter());
};

export { createHttpServer, registerAllRouters };
