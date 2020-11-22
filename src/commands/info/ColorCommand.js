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
    message, args, server, user,
  }, t) {
    const haspadrao = await user.cores.filter((pc) => pc.cor === '#a788ff');

    if (haspadrao.length === 0) {
      user.cores.push({
        nome: '0 - Padrão',
        cor: '#a788ff',
        preço: 0,
      });
      user.save().then();
    }
    const embed = new MessageEmbed()
      .setTitle(`🏳️‍🌈 | ${t('commands:color.embed_title')}`)
      .setColor('#aee285')
      .setDescription(t('commands:color.embed_description', { prefix: server.prefix }));

    const validArgs = [];

    for (let i = 0; i < user.cores.length; i++) {
      embed.addField(`${user.cores[i].nome}`, `${user.cores[i].cor}`);
      validArgs.push(user.cores[i].nome.replace(/[^\d]+/g, ''));
    }
    if (!args[0]) return message.channel.send(message.author, embed);

    if (validArgs.includes(args[0])) {
      const findColor = user.cores.filter((cor) => cor.nome.startsWith(args[0]) || cor.nome.startsWith(`**${args[0]}`));

      const dataChoose = {
        title: t('commands:color.dataChoose.title'),
        description: t('commands:color.dataChoose.title'),
        color: findColor[0].cor,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
      };

      message.channel.send(message.author, { embed: dataChoose });
      user.cor = findColor[0].cor;
      user.save();
    } else message.menheraReply('error', t('commands:color.no-own', { prefix: server.prefix }));
  }
};
