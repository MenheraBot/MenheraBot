import { setInteractionCreateEvent } from './handlers/interactionCreate';

const setupEventHandlers = (): void => {
  setInteractionCreateEvent();
};

export { setupEventHandlers };
