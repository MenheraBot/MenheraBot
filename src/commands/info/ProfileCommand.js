const { MessageAttachment } = require('discord.js');
const Command = require('../../structures/command');
const Util = require('../../utils/Util');
const { ProfileImage } = require('../../utils/Canvas');

module.exports = class ProfileCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'profile',
      aliases: ['perfil'],
      cooldown: 5,
      clientPermissions: ['ATTACH_FILES'],
      category: 'info',
    });
  }

  async run({ message, args, authorData: selfData }, t) {
    const authorData = selfData ?? new this.client.database.Users({ id: message.author.id });
    const userId = Util.getIdByMention(args[0]);

    let user = authorData;
    let member = message.author;
    let marry = 'false';

    if (userId && userId !== message.author) {
      try {
        member = await this.client.users.fetch(args[0].replace(/[<@!>]/g, ''));
        if (member.bot) return message.menheraReply('error', t('commands:profile.bot'));

        user = await this.client.database.Users.findOne({ id: member.id });
      } catch {
        return message.menheraReply('error', t('commands:profile.unknow-user'));
      }
    }
    if (user?.casado !== 'false' && user?.casado) marry = await this.client.users.fetch(user.casado);

    if (!user) return message.menheraReply('error', t('commands:profile.no-dbuser'));
    if (user.ban) return message.menheraReply('error', t('commands:profile.banned', { reason: user.banReason }));

    const avatar = member.displayAvatarURL({ format: 'png' });

    const image = await ProfileImage({
      member, user, avatar, marry,
    }, t);

    message.channel.send(message.author, new MessageAttachment(image, 'profile.png'));
  }
};
