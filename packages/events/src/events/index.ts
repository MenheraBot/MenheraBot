import { logger } from '../utils/logger';
import { setGuildDeleteEvent } from './handlers/guildDelete';
import { setInteractionCreateEvent } from './handlers/interactionCreate';
import { setReadyEvent } from './handlers/ready';

const setupEventHandlers = (): void => {
  logger.debug('Setting up event handlers');
  setInteractionCreateEvent();
  setGuildDeleteEvent();
  setReadyEvent();
};

export { setupEventHandlers };
