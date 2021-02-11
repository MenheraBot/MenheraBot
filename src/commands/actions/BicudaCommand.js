const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class BicudaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bicuda',
      aliases: ['chutar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('bicuda');
    const user = message.mentions.users.first();

    if (!user) {
      return message.menheraReply('error', t('commands:bicuda.no-mention'));
    }

    if (user && user.bot) return message.menheraReply('warn', t('commands:bicuda.bot'));

    if (user === message.author) {
      return message.menheraReply('error', t('commands:bicuda.self-mention'));
    }

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:bicuda.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:bicuda.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    return message.channel.send(embed);
  }
};
