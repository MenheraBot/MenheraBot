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
  async run({ message, args }, t) {
    const user = await this.client.database.Users.findOne({ id: args[0] });
    const badgeId = parseInt(args[1]);

    if (!badgeId) return message.menheraReply('error', 'Cade o id da badge?');

    if (user.badges) {
      user.badges.push({ id: badgeId, obtainAt: Date.now() });
    } else {
      user.badges = [{ id: badgeId, obtainAt: Date.now() }];
    }
    user.save();
    message.channel.send('Concluido');
  }
};
