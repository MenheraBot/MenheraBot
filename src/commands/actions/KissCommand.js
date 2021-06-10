const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class KissCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kiss',
      aliases: ['beijar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('kiss');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) return ctx.replyT('error', 'commands:kiss.bot');

    if (!user) {
      return ctx.replyT('error', 'commands:kiss.no-mention');
    }

    if (user === ctx.message.author) {
      return ctx.replyT('error', 'commands:kiss.self-mention');
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:kiss.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:kiss.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
