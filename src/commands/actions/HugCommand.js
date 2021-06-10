const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class HugCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'hug',
      aliases: ['abracar', 'abraçar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('hug');
    const user = ctx.message.mentions.users.first();

    if (user && user.bot) return ctx.replyT('error', 'commands:hug.bot');

    if (!user) {
      return ctx.replyT('error', 'commands:hug.no-mention');
    }

    if (user === ctx.message.author) {
      return ctx.replyT('error', 'commands:hug.self-mention');
    }

    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:hug.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:hug.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
