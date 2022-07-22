import { ChatInputInteractionCommand } from '../../types/menhera';
import { readDirectory } from '../../utils/fileUtils';
import { bot } from '../../index';
import { logger } from '../../utils/logger';

const loadCommands = (): void => {
  const addToMap = (command: ChatInputInteractionCommand, filePath: string): void => {
    command.path = filePath;

    bot.commands.set(command.name, command);

    logger.debug(`Loaded command ${command.name} from ${filePath}`);
    // TODO: ensure commands in database
  };

  readDirectory('../../commands', addToMap);
};

export { loadCommands };
