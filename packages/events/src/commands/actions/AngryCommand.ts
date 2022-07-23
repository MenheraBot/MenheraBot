import { ApplicationCommandOptionTypes, InteractionResponseTypes } from 'discordeno/types';
import { Interaction } from 'discordeno/transformers';

import { logger } from '../../utils/logger';
import { ChatInputInteractionCommand } from '../../types/commands';
import { bot } from '../../index';

const AngryCommand: ChatInputInteractionCommand = {
  path: '',
  name: 'raiva',
  nameLocalizations: { 'en-US': 'angry' },
  description: '「😡」・Mostre a todos que está com raiva',
  descriptionLocalizations: { 'en-US': '「😡」・Shows to everyone that you are angry' },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário que te deixou com raiva',
      descriptionLocalizations: { 'en-US': 'User that made you angry' },
      required: false,
    },
    {
      name: 'motivo',
      nameLocalizations: { 'en-US': 'reason' },
      type: ApplicationCommandOptionTypes.User,
      description: 'Por que você está com raiva?',
      descriptionLocalizations: { 'en-US': 'Why are you angry?' },
      required: false,
    },
  ],
  category: 'actions',
  authorDataFields: [],
  dmPermission: false,
  execute: async (ctx) => {
    logger.debug(ctx, 'AngryCommand');

    const startTime = Date.now();

    const { id, token } = ctx as Interaction;

    logger.debug(id, token);

    await bot.helpers.sendInteractionResponse(id, token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: { content: 'Pinging...' },
    });

    bot.helpers.editInteractionResponse(token, {
      content: `🏓 Pong! (${Date.now() - startTime}ms)`,
    });
  },
};

export default AngryCommand;
