import { logger } from '../utils/logger';
import { setInteractionCreateEvent } from './handlers/interactionCreate';

const setupEventHandlers = (): void => {
  logger.debug('Setting up event handlers');
  setInteractionCreateEvent();
};

export { setupEventHandlers };
