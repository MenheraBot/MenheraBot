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

  async run({ message, authorData: selfData }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });

    if (authorData.casado && authorData.casado !== 'false') {
      return this.divorciar(authorData, message, t);
    }
    message.menheraReply('warn', t('commands:divorce.author-single'));
  }

  async divorciar(authorData, message, t) {
    const user2Mention = await this.client.users.fetch(authorData.casado);

    message.channel.send(`${t('commands:divorce.confirmation')} ${user2Mention}`).then((msg) => {
      msg.react('✅');
      msg.react('❌');

      const filterYes = (reaction, usuario) => reaction.emoji.name === '✅' && usuario.id === message.author.id;
      const filterNo = (reação, u) => reação.emoji.name === '❌' && u.id === message.author.id;

      const yesColetor = msg.createReactionCollector(filterYes, { max: 1, time: 14500 });
      const noColetor = msg.createReactionCollector(filterNo, { max: 1, time: 14500 });

      noColetor.on('collect', () => {
        msg.reactions.removeAll().catch();
        message.menheraReply('success', t('commands:divorce.canceled'));
      });

      yesColetor.on('collect', async () => {
        msg.reactions.removeAll().catch();
        message.channel.send(`${message.author} ${t('commands:divorce.confirmed_start')} ${user2Mention}. ${t('commands:divorce.confirmed_end')}`);

        await this.client.database.Users.updateOne({ id: authorData.casado }, { $set: { casado: 'false', data: null } });
        this.client.database.Users.updateOne({ id: message.author.id }, { $set: { casado: 'false', data: null } });
      });
    });
  }
};
