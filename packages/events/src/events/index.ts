import { logger } from '../utils/logger.js';
import { setInteractionCreateEvent } from './handlers/interactionCreate.js';
import { setReadyEvent } from './handlers/ready.js';

const setupEventHandlers = (): void => {
  logger.debug('Setting up event handlers');
  setInteractionCreateEvent();
  setReadyEvent();
};

export { setupEventHandlers };
