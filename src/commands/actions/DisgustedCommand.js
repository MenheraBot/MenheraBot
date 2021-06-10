const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class DisgustedCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'disgusted',
      aliases: ['nojo'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('disgusted');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user && user.bot) return ctx.replyT('error', 'commands:disgusted.bot');

    if (!user || user.id === ctx.message.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:disgusted.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${ctx.message.author} ${ctx.locale('commands:disgusted.no-mention.embed_description')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);

      return ctx.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle('Nojo')
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:disgusted.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    return ctx.send(embed);
  }
};
