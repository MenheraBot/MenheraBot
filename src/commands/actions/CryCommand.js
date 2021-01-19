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
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

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
      'https://i.imgur.com/yUUU4Ml.gif',
      'https://i.imgur.com/IuPpRvr.gif',
      'https://i.imgur.com/z9CPRWD.gif',
      'https://i.imgur.com/q2XOosW.gif',
      'https://i.imgur.com/CXaD9pV.gif',
      'https://i.imgur.com/DOtiIVJ.gif',
      'https://i.imgur.com/BMM1gPD.gif',
      'https://i.imgur.com/MXLh6z3.gif',
      'https://i.imgur.com/sVy6ald.gif',
      'https://i.imgur.com/ceQ3Suy.gif',
      'https://i.imgur.com/w98EsZq.gif',
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
