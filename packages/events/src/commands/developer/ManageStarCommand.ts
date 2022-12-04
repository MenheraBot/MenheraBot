import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';
import starsRepository from '../../database/repositories/starsRepository';
import { createCommand } from '../../structures/command/createCommand';

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
        break;
      case 'remove':
        await starsRepository.removeStars(id, value);
        break;
      case 'set':
        await starsRepository.setStars(id, value);
        break;
    }

    await ctx.makeMessage({
      content: `Estrelinhas de <@${id}> alteradas com sucesso :star:\n**Operação**: ${operation}\n**Valor**: ${value}`,
    });

    finishCommand();
  },
});

export default ReloadLocalesCommand;
