const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class BiteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bite',
      aliases: ['morder'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('bite');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) return ctx.replyT('warn', 'commands:bite.bot');

    if (!user) {
      return ctx.replyT('error', 'commands:bite.no-mention');
    }

    if (user === ctx.message.author) {
      return ctx.replyT('error', 'commands:bite.self-mention');
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:bite.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:bite.embed_description')} ${user} :3`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
