import { logger } from '../../utils/logger';
import { bot } from '../../index';

const setInteractionCreateEvent = (): void => {
  bot.events.interactionCreate = async (_, interaction) => {
    logger.debug(`[EVENT] InteractionCreate: ${interaction.id}`);

    // executeSlashCommand(bot, interaction);
  };
};

export { setInteractionCreateEvent };
