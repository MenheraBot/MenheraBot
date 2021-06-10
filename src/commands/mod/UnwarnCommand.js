const Command = require('../../structures/command');

module.exports = class UnwarnCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unwarn',
      aliases: ['desavisar'],
      userPermissions: ['KICK_MEMBERS'],
      category: 'moderação',
    });
  }

  async run(ctx) {
    if (!ctx.args[0]) return ctx.replyT('error', 'commands:unwarn.no-mention');

    let user;
    try {
      user = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
    } catch {
      return ctx.replyT('error', 'commands:unwarn.no-mention');
    }

    if (!user) return ctx.replyT('error', 'commands:unwarn.no-mention');
    if (user.bot) return ctx.replyT('error', 'commands:unwarn.bot');
    if (user.id === ctx.message.author.id) return ctx.replyt('error', 'commands:unwarn.self-mention');
    if (!ctx.message.guild.members.cache.get(user.id)) return ctx.replyT('error', 'commands:unwarn.invalid-member');

    this.client.database.Warns.findOneAndDelete({ userId: user.id, guildId: ctx.message.guild.id }).sort([
      ['data', 'descending'],
    ]).exec((err, db) => {
      if (err) console.log(err);
      if (!db || db.length < 1) return ctx.reply('error', `${user} ${ctx.locale('commands:unwarn.no-warns')}`);
      ctx.replyT('success', 'commands:unwarn.success');
    });
  }
};
