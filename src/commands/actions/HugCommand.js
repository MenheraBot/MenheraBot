const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class HugCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hug',
      aliases: ['abracar', 'abraçar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('hug');
    const user = message.mentions.users.first();

    if (user && user.bot) return message.menheraReply('error', t('commands:hug.bot'));

    if (!user) {
      return message.menheraReply('error', t('commands:hug.no-mention'));
    }

    if (user === message.author) {
      return message.menheraReply('error', t('commands:hug.self-mention'));
    }

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:hug.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:hug.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
