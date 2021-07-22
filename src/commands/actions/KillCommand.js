const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { getImageUrl } = require('../../utils/HTTPrequests');

module.exports = class KillCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'kill',
      aliases: ['matar'],
      clientPermissions: ['EMBED_LINKS'],
      category: 'ações',
    });
  }

  async run(ctx) {
    const rand = await getImageUrl('kill');
    const user = ctx.message.mentions.users.first();
    const avatar = ctx.message.author.displayAvatarURL({ format: 'png', dynamic: true });

    if (!user) {
      return ctx.replyT('error', 'commands:kill.no-mention');
    }

    if (user === ctx.message.author) {
      return ctx.replyT('error', 'commands:kill.self-mention');
    }

    if (user.bot) {
      // links de robos
      const ro = [
        'https://i.imgur.com/tv9wQai.gif',
        'https://i.imgur.com/X9uUyEB.gif',
        'https://i.imgur.com/rtsjxWQ.gif',
      ];

      const Rrand = ro[Math.floor(Math.random() * ro.length)];

      const Rembed = new MessageEmbed()
        .setTitle(ctx.locale('commands:kill.bot.embed_title'))
        .setColor('#000000')
        .setDescription(
          `${ctx.locale('commands:kill.bot.embed_description_start')} \n${
            ctx.message.author
          } ${ctx.locale('commands:kill.bot.embed_description_end')} ${user}`,
        )
        .setImage(Rrand)
        .setThumbnail(avatar)
        .setAuthor(ctx.message.author.tag, avatar);

      return ctx.send(Rembed);
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:kill.embed_title'))
      .setColor('#000000')
      .setDescription(
        `${ctx.message.author} ${ctx.locale('commands:kill.embed_description')} ${user}`,
      )
      .setImage(rand)
      .setThumbnail(avatar)
      .setAuthor(ctx.message.author.tag, avatar);

    ctx.send(embed);
  }
};
