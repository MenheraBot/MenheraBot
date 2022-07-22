import { readDirectory } from '../../utils/fileUtils';
import ChatInputInteractionCommand from '../../types/menhera';
import { bot } from '../../index';
import { logger } from '../../utils/logger';

const loadCommands = (): void => {
  const addToMap = (command: ChatInputInteractionCommand, filePath: string): void => {
    bot.commands.set(command.config.name, command);

    logger.debug(`Loaded command ${command.config.name} from ${filePath}`);
    // TODO: ensure commands in database
  };

  readDirectory('../../commands', addToMap);
};

export { loadCommands };
