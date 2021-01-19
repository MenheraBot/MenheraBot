const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class BiteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bite',
      aliases: ['morder'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const list = [
      'https://i.imgur.com/mimLPx3.gif',
      'https://i.imgur.com/AZ2dUaq.gif',
      'https://i.imgur.com/xKJw3mX.gif',
      'https://i.imgur.com/wb14mqC.gif',
      'https://i.imgur.com/k5tADh7.gif',
      'https://i.imgur.com/hrNGU3m.gif',
      'https://i.imgur.com/xVktxTq.gif',
      'https://i.imgur.com/2qyOuIA.gif',
      'https://i.imgur.com/w85cQBz.gif',
      'https://i.imgur.com/kvzFiiZ.gif',
      'https://i.imgur.com/MCBESgv.gif',
      'https://i.imgur.com/Gkf2rDV.gif',
      'https://i.imgur.com/i21hLaf.gif',
      'https://i.imgur.com/lrwc996.gif',
      'https://i.imgur.com/7k8ZG7t.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();

    if (user && user.bot) return message.menheraReply('warn', t('commands:bite.bot'));

    if (!user) {
      return message.menheraReply('error', t('commands:bite.no-mention'));
    }

    if (user === message.author) {
      return message.menheraReply('error', t('commands:bite.self-mention'));
    }

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:bite.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:bite.embed_description')} ${user} :3`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
