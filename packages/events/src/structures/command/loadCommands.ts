import { resolve } from 'node:path';

import commandRepository from '../../database/repositories/commandRepository.js';
import { ChatInputInteractionCommand } from '../../types/commands.js';
import { readDirectory } from '../../utils/fileUtils.js';
import { bot } from '../../index.js';
import { populateCommand } from '../../modules/dailies/dailies.js';

const loadCommands = (): void => {
  const addToMap = (command: ChatInputInteractionCommand, filePath: string): void => {
    command.path = filePath;

    bot.commands.set(command.name, command);
    commandRepository.ensureCommandInfo(command.name);
    if (command.category !== 'dev') populateCommand(command.name);
  };

  const pathToResolve = process.env.NODE_ENV === 'test' ? 'packages/events/src' : 'dist';

  readDirectory(resolve(`${pathToResolve}/commands`), addToMap);
};

export { loadCommands };
