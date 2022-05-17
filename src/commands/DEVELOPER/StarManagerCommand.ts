import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class ManageStartSlashCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'managestar',
      description: '[DEV] Manipula as estrelinhas de alguém',
      category: 'dev',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'User pra modifica',
          required: true,
        },
        {
          name: 'option',
          description: 'Bagulho pra coisa',
          type: 'STRING',
          choices: [
            { name: 'SETTAR', value: 'set' },
            { name: 'ADCIONAR', value: 'add' },
            { name: 'REMOVER', value: 'remove' },
          ],
          required: true,
        },
        {
          name: 'value',
          description: 'valor pra coisa',
          type: 'INTEGER',
          required: true,
        },
      ],
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const { id } = ctx.options.getUser('user', true);
    const value = ctx.options.getInteger('value', true);
    switch (ctx.options.getString('option', true)) {
      case 'add':
        await ctx.client.repositories.starRepository.add(id, value);
        break;
      case 'remove':
        await ctx.client.repositories.starRepository.remove(id, value);
        break;
      case 'set':
        await ctx.client.repositories.starRepository.set(id, value);
        break;
    }

    await ctx.makeMessage({
      content: `Estrelinhas de <@${id}> alteradas com sucesso :star:\n**Operação**: ${ctx.options.getString(
        'option',
      )}\n**Valor**: ${value}`,
    });
  }
}
