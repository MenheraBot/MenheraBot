const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class MamarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'mamar',
      aliases: ['suck', 'sugada'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const mention = ctx.message.mentions.users.first();

    if (!mention) return ctx.replyT('error', 'commands:mamar.no-mention');

    if (mention.bot) return ctx.reply('warn', `${ctx.locale('commands:mamar.bot')} ${mention}`);

    if (mention === ctx.message.author) return ctx.replyT('error', 'commands:mamar.self-mention');

    const rand = await getImageUrl('mamar');
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:mamar.embed_title'))
      .setColor('#000000')
      .setDescription(`${ctx.message.author} ${ctx.locale('commands:mamar.embed_description')} ${mention}`)
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
    await ctx.client.repositories.mamarRepository.mamar(ctx.message.author.id, mention.id);
  }
};
