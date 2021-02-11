const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class GrumbleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'grumble',
      aliases: ['resmungar', 'humpf'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run({ message }, t) {
    const avatar = message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const rand = await getImageUrl('grumble');

    const embed = new MessageEmbed()
      .setTitle(t('commands:grumble.embed_title'))
      .setColor('#000000')
      .setDescription(`${message.author} ${t('commands:grumble.embed_description')}`)
      .setThumbnail(avatar)
      .setImage(rand)
      .setAuthor(message.author.tag, avatar);

    message.channel.send(embed);
  }
};
