/* eslint-disable no-console */
const logger = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') console.debug(...args);
  },

  error: (...args: unknown[]) => {
    console.error(...args);
  },

  info: (...args: unknown[]) => {
    console.info(...args);
  },
};

export { logger };
