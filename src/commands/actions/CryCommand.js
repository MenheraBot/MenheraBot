const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class CryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'cry',
      aliases: ['chorar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const avatar = message.author.displayAvatarURL({ format: 'png' });

    const list = [
      'https://i.imgur.com/5YWrh6Z.gif',
      'https://i.imgur.com/SzNkb87.gif',
      'https://i.imgur.com/7Yffi3x.gif',
      'https://i.imgur.com/evaPvIa.gif',
      'https://i.imgur.com/xsyIxxf.gif',
      'https://i.imgur.com/I18iVJC.gif',
      'https://i.imgur.com/fFKlGMv.gif',
      'https://i.imgur.com/XbxsKOw.gif',
      'https://i.imgur.com/iLTOyBa.gif',
      'https://i.imgur.com/mX1AWPv.gif',
      'https://i.imgur.com/MZQ8uYl.gif',
      'https://i.imgur.com/jjFtyVX.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();

    if (user && user.bot) return message.menheraReply(t('commands:cry.bot'));

    if (!user || user === message.author) {
      const embed = new MessageEmbed()
        .setTitle(t('commands:cry.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${message.author} ${t('commands:cry.no-mention.embed_description')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      message.channel.send(embed);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(t('commands:cry.embed_title'))
      .setColor('#000000')
      .setDescription(`${user} ${t('commands:cry.embed_description_start')} ${message.author} ${t('commands:cry.embed_description_end')}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    await message.channel.send(embed);
  }
};
