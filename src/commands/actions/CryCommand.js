const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

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

    const rand = await getImageUrl('cry');
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
