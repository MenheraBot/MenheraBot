import { Interaction } from 'discordeno/transformers';
import { ApplicationCommandTypes, InteractionResponseTypes } from 'discordeno/types';
import { bot } from '../../index';

const command = {
  name: 'ping',
  description: 'É o ping dos casas',
  type: ApplicationCommandTypes.ChatInput,
  execute: async (interaction: Interaction) => {
    const startTime = Date.now();

    await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: 'Pinging...' },
    });

    console.log(bot.applicationId);

    bot.helpers.editInteractionResponse(interaction.token, {
      content: `🏓 Pong! (${Date.now() - startTime}ms)`,
    });
  },
};

export default command;
