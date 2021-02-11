const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class ShotCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shot',
      aliases: ['atirar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const rand = await getImageUrl('shot');
    const user = message.mentions.users.first();

    if (!user) return message.menheraReply('error', t('commands:shot.no-mention'));

    if (user === message.author) return message.menheraReply('error', t('commands:shot.self-mention'));

    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(t('commands:shot.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:shot.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
