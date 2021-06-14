const Command = require('../../structures/command');

module.exports = class GiveBadgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'gb',
      description: 'Lansa uma badge pra um usuario',
      devsOnly: true,
      category: 'Dev',
    });
  }

  async run(ctx) {
    const badgeId = parseInt(ctx.args[1]);

    if (!badgeId) return ctx.reply('error', 'Cade o id da badge?');

    this.client.repositories.userRepository.update(ctx.args[0], { $push: { badges: { id: badgeId, obtainAt: Date.now() } } });

    ctx.send('Concluido');
  }
};
