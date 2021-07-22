const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class SlapCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'slap',
      aliases: ['tapa'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('slap');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) return ctx.replyT('error', 'commands:slap.bot');

    if (!user) return ctx.replyT('error', 'commands:slap.no-mention');

    if (user === ctx.message.author) return ctx.replyT('error', 'commands:slap.self-mention');

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:slap.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:slap.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
