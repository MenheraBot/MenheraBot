import { resolve } from 'node:path';

import { ChatInputInteractionCommand } from '../../types/commands';
import { readDirectory } from '../../utils/fileUtils';
import { bot } from '../../index';

const loadCommands = (): void => {
  const addToMap = (command: ChatInputInteractionCommand, filePath: string): void => {
    command.path = filePath;

    bot.commands.set(command.name, command);
    // TODO: ensure commands in database
  };

  readDirectory(resolve('dist/commands'), addToMap);
};

export { loadCommands };
