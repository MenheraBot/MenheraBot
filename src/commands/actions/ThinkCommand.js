const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class ThinksCOmmand extends Command {
  constructor(client) {
    super(client, {
      name: 'think',
      aliases: ['pensar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message, args, server }, t) {
    const list = [
      'https://i.imgur.com/ZIxBpIz.gif',
      'https://i.imgur.com/DcEnIqE.gif',
      'https://i.imgur.com/VxaZYdc.gif',
      'https://i.imgur.com/OTRhikB.gif',
      'https://i.imgur.com/TP20k2N.gif',
      'https://i.imgur.com/Rl4oqwb.gif',
      'https://i.imgur.com/gCoDPJi.gif',
      'https://i.imgur.com/bOKb4Hs.gif',
      'https://i.imgur.com/WiaE3Xl.gif',
      'https://i.imgur.com/obQ1JGB.gif',
      'https://i.imgur.com/IYkQWNK.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();
    const avatar = message.author.displayAvatarURL({ format: 'png' });

    if (user && user.bot) return message.menheraReply('success', t('commands:think.bot'));

    if (!user || user == message.author) {
      const embed = new MessageEmbed()
        .setTitle(t('commands:think.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${message.author} ${t('commands:think.no-mention.embed_description')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle(t('commands:think.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:think.embed_description')} ${user} hehehehe`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
