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

    ctx.send(`${ctx.locale('commands:divorce.confirmation')} ${user2Mention}`).then((msg) => {
      msg.react('✅');
      msg.react('❌');

      const filterYes = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === ctx.message.author.id;
      const filterNo = (reação, u) => reação.emoji.name === '❌' && u.id === ctx.message.author.id;

      const yesColetor = msg.createReactionCollector(filterYes, { max: 1, time: 14500 });
      const noColetor = msg.createReactionCollector(filterNo, { max: 1, time: 14500 });

      noColetor.on('collect', () => {
        ctx.replyT('success', ctx.locale('commands:divorce.canceled'));
      });

      yesColetor.on('collect', async () => {
        ctx.send(`${ctx.message.author} ${ctx.locale('commands:divorce.confirmed_start')} ${user2Mention}. ${ctx.locale('commands:divorce.confirmed_end')}`);

        await this.client.database.Users.updateOne({ id: ctx.data.user.casado }, { $set: { casado: 'false', data: null } });
        await this.client.database.Users.updateOne({ id: ctx.data.user.id }, { $set: { casado: 'false', data: null } });
      });
    });
  }
};
