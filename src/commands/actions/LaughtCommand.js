const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class LaughtCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'laugh',
      aliases: ['rir'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const list = [
      'https://i.imgur.com/Greznmg.gif',
      'https://i.imgur.com/mmFOYF1.gif',
      'https://i.imgur.com/sYILQYt.gif',
      'https://i.imgur.com/5VvTimD.gif',
      'https://i.imgur.com/QNE6CFW.gif',
      'https://i.imgur.com/jdeN8mN.gif',
      'https://i.imgur.com/QaO3Xkq.gif',
      'https://i.imgur.com/IKWfYJF.gif',
      'https://i.imgur.com/qy4aNDu.gif',
      'https://i.imgur.com/QG8Cce9.gif',
      'https://i.imgur.com/V4xyQbt.gif',
      'https://i.imgur.com/QkTfHY7.gif',
      'https://i.imgur.com/yqE9lK3.gif',
      'https://i.imgur.com/BzDb8Z0.gif',
      'https://i.imgur.com/adoGp22.gif',
      'https://i.imgur.com/PVlEsXN.gif',
      'https://i.imgur.com/0vCHjrW.gif',
      'https://i.imgur.com/jjPDQnI.gif',
      'https://i.imgur.com/Q5K7MJP.gif',
      'https://i.imgur.com/lYKh08M.gif',
      'https://i.imgur.com/CQNb4dT.gif',
      'https://i.imgur.com/NhmmrKd.gif',
    ];

    const rand = list[Math.floor(Math.random() * list.length)];
    const user = message.mentions.users.first();

    if (!user) {
      const embed = new MessageEmbed()
        .setTitle(t('commands:laugh.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${message.author} ${t('commands:laugh.no-mention.embed_description')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle(t('commands:laugh.embed_title'))
      .setColor('#000000')
      .setDescription(`${user} ${t('commands:laugh.embed_description_start')} ${message.author} ${t('commands:laugh.embed_description_end')}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    await message.channel.send(embed);
  }
};
