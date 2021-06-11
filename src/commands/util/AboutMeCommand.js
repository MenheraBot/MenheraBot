const Command = require('../../structures/command');

module.exports = class AboutMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'aboutme',
      aliases: ['sobremim'],
      cooldown: 10,
      category: 'util',
    });
  }

  async run(ctx) {
    const nota = ctx.args.join(' ');
    if (!nota) return ctx.replyT('error', 'commands:aboutme.no-args');
    if (nota.length > 200) return ctx.replyT('error', 'commands:aboutme.args-limit');

    await ctx.client.database.Users.updateOne({ id: ctx.message.author.id }, { $set: { nota } });

    ctx.replyT('success', 'commands:aboutme.success');
  }
};
