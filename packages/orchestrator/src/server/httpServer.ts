import Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import { getEnviroments } from '../getEnviroments';
import { createPostInteractionRouter } from './routes/postInteraction';
import { createPrometheusRouter } from './routes/prometheus';
import { createRequestCommandsRouter } from './routes/requestCommands';
import { createVoteWebhookRouter } from './routes/voteWebhook';
import { createRequestUserDataRouter } from './routes/requestUserData';
import { createPingRouter } from './routes/ping';

const server = new Koa();

const createHttpServer = (): void => {
  const { HTTP_SERVER_PORT } = getEnviroments(['HTTP_SERVER_PORT']);

  server.listen(HTTP_SERVER_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[HTTP] Server started at port ${HTTP_SERVER_PORT}`);
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
  registerRouter(createRequestCommandsRouter());
  registerRouter(createRequestUserDataRouter());
  registerRouter(createPingRouter());
};

export { createHttpServer, registerAllRouters };
