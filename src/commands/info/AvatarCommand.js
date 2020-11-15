const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'info',
    });
  }

  async run({ message, args }, t) {
    let user;
    if (args[0]) {
      try {
        user = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
      } catch {
        return message.menheraReply('error', t('commands:avatar.unknow-user'));
      }
    } else {
      user = message.author;
    }

    let cor;

    const db = await this.client.database.Users.findOne({ id: user.id });

    if (db && db.cor) {
      cor = db.cor;
    } else cor = '#a788ff';

    const img = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new MessageEmbed()
      .setTitle(t('commands:avatar.title', { user: user.username }))
      .setImage(img)
      .setColor(cor)
      .setFooter(t('commands:avatar.footer'));

    if (user.id === this.client.user.id) {
      embed.setTitle(t('commands:avatar.client_title', { user: user.username }));
      embed.setColor('#f276f3');
      embed.setFooter(t('commands:avatar.client_footer', { user: user.username }));
    }
    message.channel.send(message.author, embed);
  }
};
