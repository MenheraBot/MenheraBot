const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class KillCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kill',
      aliases: ['matar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('kill');
    const user = message.mentions.users.first();
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user) {
      return message.menheraReply('error', t('commands:kill.no-mention'));
    }

    if (user === message.author) {
      return message.menheraReply('error', t('commands:kill.self-mention'));
    }

    if (user.bot) {
      // links de robos
      const ro = [
        'https://i.imgur.com/tv9wQai.gif',
        'https://i.imgur.com/X9uUyEB.gif',
        'https://i.imgur.com/rtsjxWQ.gif',
      ];

      const Rrand = ro[Math.floor(Math.random() * ro.length)];

      const Rembed = new MessageEmbed()
        .setTitle(t('commands:kill.bot.embed_title'))
        .setColor('#000000')
        .setDescription(`${t('commands:kill.bot.embed_description_start')} \n${message.author} ${t('commands:kill.bot.embed_description_end')} ${user}`)
        .setImage(Rrand)
        .setThumbnail(avatar)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(Rembed);
    }

    const embed = new MessageEmbed()
      .setTitle(t('commands:kill.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:kill.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
