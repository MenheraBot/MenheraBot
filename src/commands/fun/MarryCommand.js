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

    const user2 = await this.client.repositories.userRepository.findOrCreate(mencionado.id);

    if (!user2) return ctx.replyT('warn', 'commands:marry.no-dbuser');

    if (user2.casado && user2.casado !== 'false') return ctx.replyT('error', 'commands:marry.mention-married');

    ctx.send(`${mencionado} ${ctx.locale('commands:marry.confirmation_start')} ${ctx.message.author}? ${ctx.locale('commands:marry.confirmation_end')}`).then(async (msg) => {
      msg.react(this.client.constants.emojis.yes);
      msg.react(this.client.constants.emojis.no);

      const validReactions = [this.client.constants.emojis.no, this.client.constants.emojis.yes];

      const filter = (reaction, usuario) => validReactions.includes(reaction.emoji.name) && usuario.id === mencionado.id;

      const colector = await msg.createReactionCollector(filter, { max: 1, time: 15000 });

      colector.on('collect', async (reaction) => {
        if (reaction.emoji.name === this.client.constants.emojis.no) return ctx.send(`${mencionado} ${ctx.locale('commands:marry.negated')} ${ctx.message.author}`);

        ctx.send(`💍${ctx.message.author} ${ctx.locale('commands:marry.acepted')} ${mencionado}💍`);

        moment.locale('pt-br');

        const dataFormated = moment(Date.now()).format('l LTS');

        await this.client.repositories.relationshipRepository.marry(ctx.message.author.id, mencionado.id, dataFormated);
      });
    });
  }
};
