import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import { getEnviroments } from '../utils/getEnviroments';

const initializeSentry = (): void => {
  const { SENTRY_DNS } = getEnviroments(['SENTRY_DNS']);

  if (process.env.NOMICROSERVICES) return;

  Sentry.init({
    dsn: SENTRY_DNS,
    environment: process.env.NODE_ENV ?? 'Unknown',
    serverName: 'Menhera Event Manager',
    tracesSampleRate: 1.0,
  });
};

export { initializeSentry };
