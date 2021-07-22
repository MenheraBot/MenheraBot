const Command = require('../../structures/Command');

module.exports = class RpgResetCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reset',
      aliases: ['resetar'],
      cooldown: 5,
      category: 'rpg',
    });
  }

  async run(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:reset.non-aventure');
    if (user.level < 4) return ctx.replyT('error', 'commands:reset.low-level');

    ctx.replyT('warn', 'commands:reset.confirm');

    const filter = (m) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, {
      max: 1,
      time: 30000,
      errors: ['time'],
    });

    collector.on('collect', async (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        this.client.database.Rpg.findByIdAndDelete(ctx.message.author.id).then(
          ctx.replyT('success', 'commands:reset.success', { prefix: ctx.data.server.prefix }),
        );
      } else ctx.replyT('error', 'commands:reset.cancel');
    });
  }
};
