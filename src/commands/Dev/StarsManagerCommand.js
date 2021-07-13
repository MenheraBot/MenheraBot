const Command = require('../../structures/command');

module.exports = class StarManagerCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'managestar',
      aliases: ['ms'],
      description: 'Edite as estrelas de um usuário',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx) {
    const [id, option, value] = ctx.args;

    if (!value)
      return ctx.reply('error', 'Use `m!managestar <userId> <add | remove | set> <valor>`');

    switch (option.toLowerCase()) {
      case 'add':
        await this.client.repositories.starRepository.add(id, value);
        break;
      case 'remove':
        await this.client.repositories.starRepository.remove(id, value);
        break;
      case 'set':
        await this.client.repositories.starRepository.set(id, value);
        break;
      default:
        return ctx.reply('error', 'Use `m!managestar <userId> <add | remove | set> <valor>`');
    }

    ctx.reply('success', `Estrelinhas de ${id} alteradas com sucesso :star:`);
  }
};
