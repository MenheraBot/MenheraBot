const Command = require('../../structures/command');

module.exports = class UnTrisalCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'untrisal',
      cooldown: 10,
      category: 'diversão',
    });
  }

  async run(ctx) {
    if (ctx.data.user.trisal?.length === 0) return ctx.replyT('error', 'commands:untrisal.error');

    const msg = await ctx.send(ctx.locale('commands:untrisal.sure'));
    await msg.react('✅');

    const filter = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === ctx.message.author.id;

    const collector = msg.createReactionCollector(filter, { max: 1, time: 14000 });

    collector.on('collect', async () => {
      const user1 = await this.client.database.Users.findOne({ id: ctx.data.user.trisal[0] });
      const user2 = await this.client.database.Users.findOne({ id: ctx.data.user.trisal[1] });

      ctx.data.user.trisal = [];
      await ctx.data.user.save();

      if (user1) {
        user1.trisal = [];
        await user1.save();
      }

      if (user2) {
        user2.trisal = [];
        await user2.save();
      }
      await ctx.replyT('success', 'commands:untrisal.done');
    });
  }
};
