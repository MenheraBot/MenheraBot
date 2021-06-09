const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class SniffCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'sniff',
      aliases: ['cheirar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('sniff');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (user && user.bot) return ctx.replyT('error', 'commands:sniff.bot');

    if (!user || user.id === ctx.message.author.id) {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('commands:sniff.no-mention.embed_title'))
        .setColor('#000000')
        .setDescription(`${ctx.message.author} ${ctx.locale('commands:sniff.no-mention.embed_description')}`)
        .setThumbnail(avatar)
        .setImage(rand)
        .setAuthor(ctx.message.author.tag, avatar);

      return ctx.send(embed);
    }

    const embed = new MessageEmbed()
      .setTitle('Sniff Sniff')
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:sniff.embed_description')} ${user}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    return ctx.send(embed);
  }
};
