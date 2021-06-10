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

  // eslint-disable-next-line no-unused-vars
  async run(ctx) {
    const user = await this.client.database.Users.findOne({ id: ctx.args[0] });
    const badgeId = parseInt(ctx.args[1]);

    if (!badgeId) return ctx.reply('error', 'Cade o id da badge?');

    if (user.badges) {
      user.badges.push({ id: badgeId, obtainAt: Date.now() });
    } else {
      user.badges = [{ id: badgeId, obtainAt: Date.now() }];
    }
    user.save();
    ctx.send('Concluido');
  }
};
