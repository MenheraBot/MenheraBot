const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

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

    const rand = await getImageUrl('laugh');
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
