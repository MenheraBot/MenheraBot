const moment = require('moment');
const Command = require('../../structures/command');

module.exports = class MarryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'marry',
      aliases: ['casar'],
      category: 'diversão',
      clientPermission: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES'],
    });
  }

  async run(ctx) {
    const authorData = ctx.data.user;

    const mencionado = ctx.message.mentions.users.first();

    if (!mencionado) return ctx.replyT('error', 'commands:marry.no-mention');
    if (mencionado.bot) return ctx.replyT('error', 'commands:marry.bot');
    if (mencionado.id === ctx.message.author.id) return ctx.replyT('error', 'commands:marry.self-mention');

    if (authorData.casado && authorData.casado !== 'false') return ctx.replyT('error', 'commands:marry.married');

    const user2 = await this.client.database.Users.findOne({ id: mencionado.id });

    if (!user2) return ctx.replyT('warm', 'commands:marry.no-dbuser');

    if (user2.casado && user2.casado !== 'false') return ctx.replyT('error', 'commands:marry.mention-married');

    ctx.send(`${mencionado} ${ctx.locale('commands:marry.confirmation_start')} ${ctx.message.author}? ${ctx.locale('commands:marry.confirmation_end')}`).then((msg) => {
      msg.react(this.client.constants.emojis.yes);
      msg.react(this.client.constants.emojis.no);

      const filterYes = (reaction, usuario) => reaction.emoji.name === this.client.constants.emojis.yes && usuario.id === mencionado.id;
      const filterNo = (reação, user) => reação.emoji.name === this.client.constants.emojis.no && user.id === mencionado.id;

      const yesColetor = msg.createReactionCollector(filterYes, { max: 1, time: 14500 });
      const noColetor = msg.createReactionCollector(filterNo, { max: 1, time: 14500 });

      noColetor.on('collect', () => ctx.send(`${mencionado} ${ctx.locale('commands:marry.negated')} ${ctx.message.author}`));

      yesColetor.on('collect', async () => {
        ctx.send(`💍${ctx.message.author} ${ctx.locale('commands:marry.acepted')} ${mencionado}💍`);

        moment.locale('pt-br');

        const dataFormated = moment(Date.now()).format('l LTS');

        await this.client.database.Users.updateOne({ id: ctx.message.author.id }, { $set: { casado: mencionado.id, data: dataFormated } });
        await this.client.database.Users.updateOne({ id: mencionado.id }, { $set: { casado: ctx.message.author.id, data: dataFormated } });
      });
    });
  }
};
