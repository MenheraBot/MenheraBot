import { bot } from '../index.js';
import { ApiCommandInformation } from '../types/commands.js';
import { postCommandsInformation } from './apiRequests/commands.js';

const updateCommandsOnApi = async (): Promise<void> => {
  const toAPIData = new Map<string, ApiCommandInformation>();

  // FIXME: update API disabledCommands
  bot.commands.forEach((c) => {
    if (c.category === 'dev') return;

    toAPIData.set(c.name, {
      name: c.name,
      category: c.category,
      description: c.description,
      options: c.options ?? [],
      descriptionLocalizations: c.descriptionLocalizations,
      nameLocalizations: c.nameLocalizations,
      disabled: {
        isDisabled: false,
        reason: null,
      },
    });
  });

  await postCommandsInformation(Array.from(toAPIData.values()));
};

export { updateCommandsOnApi };
