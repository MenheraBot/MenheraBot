import { executeSlashCommand } from '../../commands/executeCommand';
import { bot } from '../../index';

const setInteractionCreateEvent = () => {
  bot.events.interactionCreate = async (_, interaction) => {
    console.log(`[EVENT] InteractionCreate: ${interaction.id}`);

    executeSlashCommand(bot, interaction);
  };
};

export { setInteractionCreateEvent };
