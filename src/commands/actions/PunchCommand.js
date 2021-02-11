const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class PunchCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'punch',
      aliases: ['socar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('punch');
    const user = message.mentions.users.first();

    if (user && user.bot) return message.menheraReply('error', t('commands:punch.bot'));

    if (!user) return message.menheraReply('error', t('commands:punch.no-mention'));

    if (user === message.author) return message.menheraReply('error', t('commands:punch.self-mention'));

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:punch.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:punch.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
