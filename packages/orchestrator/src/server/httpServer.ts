import Koa from 'koa';
import { koaBody } from 'koa-body';
import Router from 'koa-router';
import { getEnviroments } from '../getEnviroments.js';
import { createPostInteractionRouter } from './routes/postInteraction';
import { createPrometheusRouter } from './routes/prometheus';
import { createRequestCommandsRouter } from './routes/requestCommands';
import { createVoteWebhookRouter } from './routes/voteWebhook';
import { createRequestUserDataRouter } from './routes/requestUserData';
import { createPingRouter } from './routes/ping';
import { createThankSuggestionRouter } from './routes/thankSuggestion';

const server = new Koa();

const createHttpServer = (): void => {
  const { HTTP_SERVER_PORT } = getEnviroments(['HTTP_SERVER_PORT']);

  server.listen(HTTP_SERVER_PORT, () => {
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
  registerRouter(createThankSuggestionRouter());
};

export { createHttpServer, registerAllRouters };
