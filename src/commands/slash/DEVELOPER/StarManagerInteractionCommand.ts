import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class MaintenanceSlashInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'managestar',
      description: 'MANAGEIA AS STAR',
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
      defaultPermission: false,
      devsOnly: true,
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const { id } = ctx.options.getUser('user', true);
    const value = ctx.options.getInteger('value', true);
    switch (ctx.options.getString('option', true)) {
      case 'add':
        await this.client.repositories.starRepository.add(id, value);
        break;
      case 'remove':
        await this.client.repositories.starRepository.remove(id, value);
        break;
      case 'set':
        await this.client.repositories.starRepository.set(id, value);
        break;
    }

    await ctx.replyE('success', `Estrelinhas de ${id} alteradas com sucesso :star:`);
  }
}
