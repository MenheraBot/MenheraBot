import * as Sentry from '@sentry/node';
import { getEnviroments } from '../utils/getEnviroments';

const initializeSentry = (): void => {
  const { SENTRY_DSN } = getEnviroments(['SENTRY_DSN']);

  if (process.env.NOMICROSERVICES) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'Unknown',
    release: process.env.VERSION,
    serverName: 'ctb1-menhera1',
    tracesSampleRate: 1.0,
  });
};

export { initializeSentry };
