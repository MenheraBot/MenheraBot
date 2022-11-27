import { startGameLoop } from '../../modules/bicho/bichoManager';
import { logger } from '../../utils/logger';
import { bot } from '../../index';

const setReadyEvent = (): void => {
  bot.events.ready = async () => {
    logger.debug("I'M THE MASTER");
    startGameLoop(); 
  };
};

export { setReadyEvent };
