import { bot } from '..';
import commandRepository from '../database/repositories/commandRepository';
import { ApiCommandInformation } from '../types/commands';
import { postCommandsInformation } from './apiRequests/commands';

const updateCommandsOnApi = async (): Promise<void> => {
  const toAPIData = new Map<string, ApiCommandInformation>();
  const disabledCommands = await commandRepository.getAllCommandsInMaintenance();

  bot.commands.forEach((c) => {
    if (c.category === 'dev') return;
    const isCommandInMaintenance = disabledCommands.find((a) => a._id?.toString() === c.name);

    toAPIData.set(c.name, {
      name: c.name,
      category: c.category,
      description: c.description,
      options: c.options ?? [],
      descriptionLocalizations: c.descriptionLocalizations,
      nameLocalizations: c.nameLocalizations,
      disabled: {
        isDisabled: isCommandInMaintenance?.maintenance ?? false,
        reason: isCommandInMaintenance?.maintenanceReason ?? null,
      },
    });
  });

  await postCommandsInformation(Array.from(toAPIData.values()));
};

export { updateCommandsOnApi };
