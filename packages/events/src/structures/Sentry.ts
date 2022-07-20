import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { getEnviroments } from 'config';

const initializeSentry = () => {
  const { SENTRY_DNS } = getEnviroments(['SENTRY_DNS']);

  Sentry.init({
    dsn: SENTRY_DNS,
    environment: process.env.NODE_ENV ?? 'Unknown',
    serverName: 'Menhera Event Manager',
    tracesSampleRate: 1.0,
  });
};

export { initializeSentry };
