const Command = require('../../structures/command');

module.exports = class DivorceCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'divorce',
      aliases: ['divorciar'],
      cooldown: 10,
      category: 'diversão',
      clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx) {
    const authorData = ctx.data.user;

    if (authorData.casado && authorData.casado !== 'false') {
      return this.divorciar(ctx);
    }
    ctx.replyT('warn', 'commands:divorce.author-single');
  }

  async divorciar(ctx) {
    const user2Mention = await this.client.users.fetch(ctx.data.user.casado);

    ctx.send(`${ctx.locale('commands:divorce.confirmation')} ${user2Mention}`).then(async (msg) => {
      msg.react(this.client.constants.emojis.yes);
      msg.react(this.client.constants.emojis.no);

      const validReactions = [this.client.constants.emojis.no, this.client.constants.emojis.yes];

      const filter = (reaction, usuario) => validReactions.includes(reaction.emoji.name) && usuario.id === ctx.message.author.id;

      const colector = msg.createReactionCollector(filter, { max: 1, time: 15000 });

      colector.on('collect', async (reaction) => {
        if (reaction.emoji.name === this.client.constants.emojis.no) return ctx.replyT('success', ctx.locale('commands:divorce.canceled'));
        ctx.send(`${ctx.message.author} ${ctx.locale('commands:divorce.confirmed_start')} ${user2Mention}. ${ctx.locale('commands:divorce.confirmed_end')}`);

        await this.client.repositories.relationshipRepository.divorce(ctx.data.user.casado, ctx.message.author.id);
      });
    });
  }
};
