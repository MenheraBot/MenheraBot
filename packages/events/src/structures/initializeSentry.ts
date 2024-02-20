import * as Sentry from '@sentry/node';
import { getEnviroments } from '../utils/getEnviroments';

const initializeSentry = (): void => {
  const { SENTRY_DSN } = getEnviroments(['SENTRY_DSN']);

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'Unknown',
    release: process.env.VERSION,
    serverName: 'ctb1-menhera1',
    tracesSampleRate: 1.0,
    enableTracing: true,
    integrations: [
      new Sentry.Integrations.Console(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Modules(),
      new Sentry.Integrations.RequestData({ include: { data: true } }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
      new Sentry.Integrations.Mongo({
        useMongoose: true,
        operations: ['aggregate', 'countDocuments', 'find', 'initializeOrderedBulkOp'],
      }),
    ],
  });
};

export { initializeSentry };
