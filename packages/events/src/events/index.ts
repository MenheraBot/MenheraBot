import { logger } from '../utils/logger';
import { setInteractionCreateEvent } from './handlers/interactionCreate';
import { setReadyEvent } from './handlers/ready';

const setupEventHandlers = (): void => {
  logger.debug('Setting up event handlers');
  setInteractionCreateEvent();
  setReadyEvent();
};

export { setupEventHandlers };
