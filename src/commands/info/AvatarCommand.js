const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const Util = require('../../utils/Util');

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run(ctx) {
    const authorData = ctx.data.user;

    let user = ctx.message.author;
    let db = authorData;

    const userId = Util.getIdByMention(ctx.args[0]);
    if (userId && userId !== ctx.message.author) {
      try {
        user = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
        db = await this.client.database.repositories.userRepository.find(user.id);
      } catch {
        return ctx.replyT('error', 'commands:avatar.unknow-user');
      }
    }

    const cor = db?.cor ?? '#a788ff';

    const img = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:avatar.title', { user: user.username }))
      .setImage(img)
      .setColor(cor)
      .setFooter(ctx.locale('commands:avatar.footer'));

    if (user.id === this.client.user.id) {
      embed.setTitle(ctx.locale('commands:avatar.client_title', { user: user.username }));
      embed.setColor('#f276f3');
      embed.setFooter(ctx.locale('commands:avatar.client_footer', { user: user.username }));
    }
    ctx.sendC(ctx.message.author, embed);
  }
};
