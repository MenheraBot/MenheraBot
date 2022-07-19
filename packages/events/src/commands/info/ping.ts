import { Interaction } from 'discordeno/transformers';
import { ApplicationCommandTypes, InteractionResponseTypes } from 'discordeno/types';
import { bot } from '../../index';

const command = {
  name: 'ping',
  description: 'É o ping dos casas',
  type: ApplicationCommandTypes.ChatInput,
  execute: async (interaction: Interaction) =>
    bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: 'Pong!' },
    }),
};

export default command;
