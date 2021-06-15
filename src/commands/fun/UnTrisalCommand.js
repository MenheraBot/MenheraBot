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
    await msg.react(this.client.constants.emojis.yes);

    const filter = (reaction, usuario) => reaction.emoji.name === this.client.constants.emojis.yes && usuario.id === ctx.message.author.id;

    const collector = msg.createReactionCollector(filter, { max: 1, time: 14000 });

    collector.on('collect', async () => {
      this.client.repositories.userRepository.multiUpdate([ctx.message.author.id, ctx.data.user.trisal[0], ctx.data.user.trisal[1]], { trisal: [] });

      await ctx.replyT('success', 'commands:untrisal.done');
    });
  }
};
