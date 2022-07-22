import { logger } from '../../utils/logger';
import { bot } from '../../index';
import { InteractionTypes } from 'discordeno/types';

const setInteractionCreateEvent = (): void => {
  bot.events.interactionCreate = async (_, interaction) => {
    logger.debug(`[EVENT] InteractionCreate: ${interaction.id}`);

    if (interaction.type === InteractionTypes.ApplicationCommand) {
      const foundCOmmand = bot.commands.get(interaction.data?.name as string);
      if (foundCOmmand) foundCOmmand.execute({});
    }

    // executeSlashCommand(bot, interaction);
  };
};

export { setInteractionCreateEvent };
