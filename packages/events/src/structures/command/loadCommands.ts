import { resolve } from 'node:path';

import commandRepository from '../../database/repositories/commandRepository';
import { ChatInputInteractionCommand } from '../../types/commands';
import { readDirectory } from '../../utils/fileUtils';
import { bot } from '../../index';

const loadCommands = (): void => {
  const addToMap = (command: ChatInputInteractionCommand, filePath: string): void => {
    command.path = filePath;

    bot.commands.set(command.name, command);
    commandRepository.ensureCommandInfo(command.name);
  };

  const pathToResolve = process.env.TESTING ? 'packages/events/src' : 'dist';

  readDirectory(resolve(`${pathToResolve}/commands`), addToMap);
};

export { loadCommands };
