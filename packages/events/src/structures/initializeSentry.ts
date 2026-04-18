import * as Sentry from '@sentry/node';
import { hostname } from 'node:os';
import { getEnviroments } from '../utils/getEnviroments.js';

const initializeSentry = (): void => {
  const { SENTRY_DSN } = getEnviroments(['SENTRY_DSN']);

  if (process.env.NOMICROSERVICES) return;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'Unknown',
  release: process.env.VERSION,
  serverName: hostname(),
  sendDefaultPii: true,
  tracesSampleRate: 1.0,

  integrations: [
    ...Sentry.getDefaultIntegrations({}),
    Sentry.requestDataIntegration({ include: { data: true } }),
  ],
});
};

export { initializeSentry };
