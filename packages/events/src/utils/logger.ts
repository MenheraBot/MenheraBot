import { MenheraClient } from '../types/menhera.js';
import { devEnviroment, testEnviroment } from './getEnviroments.js';

const logger = {
  debug: (...args: unknown[]): void => {
    if (devEnviroment) console.debug(...args);
  },

  error: (...args: unknown[]): void => {
    console.error(new Date().toISOString(), ...args);
  },

  info: (...args: unknown[]): void => {
    if (testEnviroment) return;
    console.info(new Date().toISOString(), ...args);
  },

  logSwitch: (bot: MenheraClient, ...args: unknown[]): void => {
    if (!bot.prodLogSwitch) return;
    console.info(new Date().toISOString(), ...args);
  },

  panic: (...args: unknown[]): void => {
    console.error(new Date().toISOString(), ...args);
    process.exit(1);
  },
};

export { logger };
