import { setInteractionCreateEvent } from './handlers/interactionCreate.js';
import { setReadyEvent } from './handlers/ready.js';

const setupEventHandlers = (): void => {
  setInteractionCreateEvent();
  setReadyEvent();
};

export { setupEventHandlers };
