const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class ColorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'color',
      aliases: ['cor'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run({
    message, args, server, authorData: selfData,
  }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });

    const haspadrao = await authorData.cores.filter((pc) => pc.cor === '#a788ff');

    if (haspadrao.length === 0) {
      authorData.cores.push({
        nome: '0 - Padrão',
        cor: '#a788ff',
        preço: 0,
      });
      authorData.save().then();
    }
    const embed = new MessageEmbed()
      .setTitle(`🏳️‍🌈 | ${t('commands:color.embed_title')}`)
      .setColor('#aee285')
      .setDescription(t('commands:color.embed_description', { prefix: server.prefix }));

    const validArgs = [];

    for (let i = 0; i < authorData.cores.length; i++) {
      embed.addField(`${authorData.cores[i].nome}`, `${authorData.cores[i].cor}`);
      validArgs.push(authorData.cores[i].nome.replace(/[^\d]+/g, ''));
    }
    if (!args[0]) return message.channel.send(message.author, embed);

    if (validArgs.includes(args[0])) {
      const findColor = authorData.cores.filter((cor) => cor.nome.startsWith(args[0]) || cor.nome.startsWith(`**${args[0]}`));

      const dataChoose = {
        title: t('commands:color.dataChoose.title'),
        description: t('commands:color.dataChoose.title'),
        color: findColor[0].cor,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
      };

      message.channel.send(message.author, { embed: dataChoose });
      this.client.database.Users.updateOne({ id: message.author.id }, { $set: { cor: findColor[0].cor } });
    } else message.menheraReply('error', t('commands:color.no-own', { prefix: server.prefix }));
  }
};
