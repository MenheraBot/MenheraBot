const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
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

  async run(ctx) {
    const rand = await getImageUrl('resurrect');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user) return ctx.replyT('question', 'commands:resurrect.no-mention');

    if (user === ctx.message.author) return ctx.replyT('question', 'commands:resurrect.no-mention');

    if (user.bot) return ctx.replyT('success', 'commands:resurrect.bot');

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:resurrect.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:resurrect.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
