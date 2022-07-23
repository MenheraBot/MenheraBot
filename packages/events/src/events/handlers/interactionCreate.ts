import { InteractionTypes } from 'discordeno/types';
import InteractionContext from '../../structures/command/InteractionContext';
import { logger } from '../../utils/logger';
import { bot } from '../../index';

const setInteractionCreateEvent = (): void => {
  bot.events.interactionCreate = async (_, interaction) => {
    logger.debug(`[EVENT] InteractionCreate: ${interaction.id}`);

    if (interaction.type === InteractionTypes.ApplicationCommand) {
      const foundCOmmand = bot.commands.get(interaction.data?.name as string);
      if (foundCOmmand) foundCOmmand.execute(interaction as InteractionContext);
    }

    // executeSlashCommand(bot, interaction);
  };
};

export { setInteractionCreateEvent };
