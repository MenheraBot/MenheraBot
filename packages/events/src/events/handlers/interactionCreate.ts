import { logger } from 'utils/logger';
import { executeSlashCommand } from '../../commands/executeCommand';
import { bot } from '../../index';

const setInteractionCreateEvent = () => {
  bot.events.interactionCreate = async (_, interaction) => {
    logger.debug(`[EVENT] InteractionCreate: ${interaction.id}`);

    executeSlashCommand(bot, interaction);
  };
};

export { setInteractionCreateEvent };
