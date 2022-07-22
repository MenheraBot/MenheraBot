import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { logger } from '../../utils/logger';
import { ChatInputInteractionCommand } from '../../types/commands';

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
  },
};

export default AngryCommand;
