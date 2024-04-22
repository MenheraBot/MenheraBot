import { logger } from '../../../utils/logger';

let globalLoop: NodeJS.Timeout;

const initGlobalPokerQueueLoop = async (): Promise<void> => {
  globalLoop = setInterval(() => {
    logger.debug('Poker loop running', Date.now());
  }, 5_000).unref();
};

const stopGlobalPokerLoop = (): void => {
  clearInterval(globalLoop);
};

export { stopGlobalPokerLoop, initGlobalPokerQueueLoop };
