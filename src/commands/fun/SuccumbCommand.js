const Command = require('../../structures/command');

module.exports = class SuccumbCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sucumba',
      category: 'diversão',
    });
  }

  async run(ctx) {
    const user = ctx.message.mentions.users.first() || ctx.args.join(' ');
    if (!user) return ctx.reply('error', 'n/a');
    if (user.id === ctx.message.author.id) return ctx.reply('error', 'n/a');
    ctx.send(
      `${ctx.locale('commands:sucumba.start')} **${user}** ${ctx.locale('commands:sucumba.end')}`,
    );
  }
};
