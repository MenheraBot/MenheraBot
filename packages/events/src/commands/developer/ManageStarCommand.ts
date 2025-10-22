import { ApplicationCommandOptionTypes } from '@discordeno/bot';
import starsRepository from '../../database/repositories/starsRepository.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { ApiTransactionReason } from '../../types/api.js';
import { postTransaction } from '../../utils/apiRequests/statistics.js';
import { bot } from '../../index.js';
import { User } from '../../types/discordeno.js';

const ReloadLocalesCommand = createCommand({
  path: '',
  name: 'managestar',
  description: '[DEV] Manipula as estrelinhas de alguém',
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'usuário alvo da mudança',
      required: true,
    },
    {
      name: 'option',
      description: 'Tipo de manipulação das estrelinhas',
      type: ApplicationCommandOptionTypes.String,
      choices: [
        { name: 'SETTAR', value: 'set' },
        { name: 'ADCIONAR', value: 'add' },
        { name: 'REMOVER', value: 'remove' },
      ],
      required: true,
    },
    {
      name: 'value',
      description: 'Valor da alteração',
      type: ApplicationCommandOptionTypes.Integer,
      required: true,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const { id } = ctx.getOption<User>('user', 'users', true);

    const value = ctx.getOption<number>('value', false, true);

    const operation = ctx.getOption<string>('option', false, true);

    switch (operation) {
      case 'add':
        await starsRepository.addStars(id, value);

        await postTransaction(
          `${bot.ownerId}`,
          `${id}`,
          value,
          'estrelinhas',
          ApiTransactionReason.SIMON_SAYS,
        );
        break;
      case 'remove':
        await starsRepository.removeStars(id, value);

        await postTransaction(
          `${id}`,
          `${bot.ownerId}`,
          value,
          'estrelinhas',
          ApiTransactionReason.SIMON_SAYS,
        );
        break;
      case 'set':
        await starsRepository.setStars(id, value);

        await postTransaction(
          `${bot.ownerId}`,
          `${id}`,
          value,
          'estrelinhas',
          ApiTransactionReason.SIMON_SAYS,
        );
        break;
    }

    await ctx.makeMessage({
      content: `Estrelinhas de <@${id}> alteradas com sucesso :star:\n**Operação**: ${operation}\n**Valor**: ${value}`,
    });

    finishCommand();
  },
});

export default ReloadLocalesCommand;
