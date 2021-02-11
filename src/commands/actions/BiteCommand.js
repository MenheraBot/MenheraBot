const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

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
    const rand = await getImageUrl('bite');
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
