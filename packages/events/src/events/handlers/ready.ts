import { logger } from '../../utils/logger';
import { bot } from '../../index';

const setReadyEvent = (): void => {
  bot.events.ready = async () => {
    logger.debug("I'M THE MASTER");
  };
};

export { setReadyEvent };
