import * as Sentry from '@sentry/node';

import { logger } from './logger';

export const debugError = (err: Error, toSentry = true): null => {
  logger.error('Debug Error', err.message);
  if (toSentry)
    try {
      Sentry.captureException(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      logger.error('Error in debug error', e?.message ?? e);
    }

  return null;
};
