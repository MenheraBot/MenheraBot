/* eslint-disable no-console */
const logger = {
  debug: (...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'DEVELOPMENT') console.debug(...args);
  },

  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  info: (...args: unknown[]): void => {
    if (process.env.TESTING) return;
    console.info(...args);
  },

  panic: (...args: unknown[]): void => {
    console.error(...args);
    process.exit(1);
  },
};

export { logger };
