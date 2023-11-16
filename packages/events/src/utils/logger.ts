import { bot } from '..';

/* eslint-disable no-console */
const logger = {
  debug: (...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'development') console.debug(...args);
  },

  error: (...args: unknown[]): void => {
    console.error(new Date().toISOString(), ...args);
  },

  info: (...args: unknown[]): void => {
    if (process.env.NODE_ENV === 'test') return;
    console.info(new Date().toISOString(), ...args);
  },

  logSwitch: (...args: unknown[]): void => {
    if (!bot.prodLogSwitch) return;
    console.info(new Date().toISOString(), ...args);
  },

  panic: (...args: unknown[]): void => {
    console.error(new Date().toISOString(), ...args);
    process.exit(1);
  },
};

export { logger };
