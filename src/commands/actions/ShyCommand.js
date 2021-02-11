const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class ShyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shy',
      aliases: ['vergonha'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const rand = await getImageUrl('shy');
    const user = message.mentions.users.first();

    if (!user || user === message.author) {
      const embed = new MessageEmbed()
        .setTitle(t('commands:shy.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${message.author} ${t('commands:shy.no-mention.embed_description')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle(t('commands:shy.embed_title'))
      .setColor('#000000')
      .setDescription(`${user} ${t('commands:shy.embed_description_start')} ${message.author} ${t('commands:shy.embed_description_end')}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
