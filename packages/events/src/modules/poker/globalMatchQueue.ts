import pokerRepository from '../../database/repositories/pokerRepository';
import { logger } from '../../utils/logger';

let globalLoop: NodeJS.Timeout;

const queueExecution = async (): Promise<void> => {
  const playersInQueue = await pokerRepository.getTotalUsersInQueue();

  if (playersInQueue === 0) return;

  if (playersInQueue < 2) return;

  logger.debug('Poker loop running', Date.now());
};

const initGlobalPokerQueueLoop = (): void => {
  stopGlobalPokerLoop();
  globalLoop = setInterval(queueExecution, 5_000).unref();
};

const stopGlobalPokerLoop = (): void => {
  clearInterval(globalLoop);
};

export { stopGlobalPokerLoop, initGlobalPokerQueueLoop };
