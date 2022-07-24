import { InteractionTypes } from 'discordeno/types';
import i18next from 'i18next';
import InteractionContext from '../../structures/command/InteractionContext';
import { logger } from '../../utils/logger';
import { bot, interactionEmitter } from '../../index';

const setInteractionCreateEvent = (): void => {
  bot.events.interactionCreate = async (_, interaction) => {
    interactionEmitter.emit('interaction', interaction);

    logger.debug(`[EVENT] InteractionCreate: ${interaction.id}`);

    if (interaction.type !== InteractionTypes.ApplicationCommand) return;

    const command = bot.commands.get(interaction.data?.name as string);

    if (command)
      command.execute(
        new InteractionContext(interaction, i18next.getFixedT(interaction.guildLocale ?? 'pt-BR')),
      );
  };
};

export { setInteractionCreateEvent };
