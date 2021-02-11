const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class ResurrectCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resurrect',
      aliases: ['reviver', 'ressuscitar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('resurrect');
    const user = message.mentions.users.first();
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user) return message.menheraReply('question', t('commands:resurrect.no-mention'));

    if (user === message.author) return message.menheraReply('question', t('commands:resurrect.no-mention'));

    if (user.bot) return message.menheraReply('success', t('commands:resurrect.bot'));

    const embed = new MessageEmbed()
      .setTitle(t('commands:resurrect.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:resurrect.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
