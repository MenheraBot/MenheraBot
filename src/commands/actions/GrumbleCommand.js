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

  async run(ctx) {
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const rand = await getImageUrl('grumble');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:grumble.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:grumble.embed_description')}`)
      .setThumbnail(avatar)
      .setImage(rand)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
