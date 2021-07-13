const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class ThinksCOmmand extends Command {
  constructor(client) {
    super(client, {
      name: 'think',
      aliases: ['pensar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('think');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user && user.bot) return ctx.replyT('success', 'commands:think.bot');

    if (!user || user === ctx.message.author) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:think.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.message.author} ${ctx.locale('commands:think.no-mention.embed_description')}`,
        )
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);

      return ctx.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:think.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:think.embed_description')} ${user} hehehehe`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
