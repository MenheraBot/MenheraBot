const Command = require('../../structures/command');

module.exports = class AfkCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'afk',
      cooldown: 5,
      category: 'util',
    });
  }

  async run(ctx) {
    const args = ctx.args.join(' ');
    const reason = args.length ? args.replace(/`/g, '') : 'AFK';

    await ctx.client.database.Users.updateOne({ id: ctx.message.author.id }, { $set: { afk: true, afkReason: reason } });

    ctx.replyT('success', 'commands:afk.success');
  }
};
