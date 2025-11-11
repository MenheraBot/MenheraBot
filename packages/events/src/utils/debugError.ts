import * as Sentry from '@sentry/node';

import { logger } from './logger.js';

export const debugError = (err: Error, toSentry = true): null => {
  logger.error('Debug Error', err?.message);
  logger.error(err);

  // @ts-expect-error Not every errors are http errors
  if (toSentry && err?.response?.status !== 404)
    try {
      Sentry.captureException(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.error('Error in debug error', e?.message ?? e);
    }

  return null;
};
