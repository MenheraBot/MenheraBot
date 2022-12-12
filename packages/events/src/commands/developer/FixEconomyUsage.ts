import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import usagesRepository from '../../database/repositories/usagesRepository';

import { MessageFlags } from '../../utils/discord/messageUtils';
import { createCommand } from '../../structures/command/createCommand';

const FixEconomyUsageCommand = createCommand({
  path: '',
  name: 'fix_economy_usage',
  description: '[DEV] Arruma os bug do economy por enquanto',
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'Usuário pra desbugar',
      required: true,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const user = ctx.getOption<User>('user', 'users', true);

    await usagesRepository.removeUserFromEconomyUsages(user.id);

    ctx.makeMessage({ content: 'Usuário ta arrumado ai de crias', flags: MessageFlags.EPHEMERAL });

    finishCommand();
  },
});

export default FixEconomyUsageCommand;
