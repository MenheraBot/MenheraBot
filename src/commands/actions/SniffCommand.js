const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class SniffCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sniff',
      aliases: ['cheirar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('sniff');
    const user = message.mentions.users.first();
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user && user.bot) return message.menheraReply('error', t('commands:sniff.bot'));

    if (!user || user.id === message.author.id) {
      const embed = new MessageEmbed()
        .setTitle(t('commands:sniff.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${message.author} ${t('commands:sniff.no-mention.embed_description')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(message.author.tag, avatar);

      return message.channel.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle('Sniff Sniff')
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:sniff.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    return message.channel.send(embed);
  }
};
