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
  async run({ args }, t) {
    const user = await this.client.database.Users.findOne({ id: args[0] });

    if (user.badges) {
      user.badges.push({ id: 1, obtainAt: Date.now() });
    } else {
      user.badges = [{ id: 1, obtainAt: Date.now() }];
    }
  }
};
