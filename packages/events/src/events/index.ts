import { logger } from '../utils/logger';
import { setGuildDeleteEvent } from './handlers/guildDelete';
import { setInteractionCreateEvent } from './handlers/interactionCreate';

const setupEventHandlers = (): void => {
  logger.debug('Setting up event handlers');
  setInteractionCreateEvent();
  setGuildDeleteEvent();
};

export { setupEventHandlers };
