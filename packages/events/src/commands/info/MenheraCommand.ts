import { ApplicationCommandOptionTypes } from 'discordeno/types';
import InteractionContext from 'structures/command/InteractionContext';
import { MessageFlags } from 'utils/discord/messageUtils';

import { createCommand } from '../../structures/command/createCommand';

const executeSupportCommand = async (ctx: InteractionContext, finishCommand: () => void) => {
  ctx.makeMessage({
    content: ctx.prettyResponse('wink', 'commands:menhera.suporte.message'),
    flags: MessageFlags.EPHEMERAL,
  });

  finishCommand();
};

const MenheraCommand = createCommand({
  path: '',
  name: 'menhera',
  description: '「✨」・Informações referentes à Menhera',
  descriptionLocalizations: { 'en-US': '「✨」・Information regarding Menhera' },
  category: 'info',
  options: [
    {
      name: 'estatísticas',
      nameLocalizations: { 'en-US': 'statistics' },
      description: '「🤖」・Veja as estatísticas atuais da Menhera',
      descriptionLocalizations: { 'en-US': "「🤖」・See Menhera's current stats" },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'suporte',
      nameLocalizations: { 'en-US': 'support' },
      description: '「💌」・Está com problemas? Entre em meu servidor de suporte!',
      descriptionLocalizations: { 'en-US': '「💌」・Have any problems? Join my support server!' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
  ],
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const subCommand = ctx.getSubCommand();

    if (subCommand === 'suporte') return executeSupportCommand(ctx, finishCommand);
  },
});

export default MenheraCommand;
