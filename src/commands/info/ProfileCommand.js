const { MessageAttachment } = require('discord.js');
const NewHttp = require('@utils/NewHttp');
const Command = require('../../structures/command');
const Util = require('../../utils/Util');
const http = require('../../utils/HTTPrequests');

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
    if (user.ban && message.author.id !== this.client.config.owner[0]) return message.menheraReply('error', t('commands:profile.banned', { reason: user.banReason }));

    const avatar = member.displayAvatarURL({ format: 'png' });
    const usageCommands = await http.getProfileCommands(member.id);

    const userSendData = {
      cor: user.cor,
      avatar,
      votos: user.votos,
      nota: user.nota,
      tag: member.tag,
      flagsArray: member.flags?.toArray(),
      casado: user.casado,
      voteCooldown: user.voteCooldown,
      badges: user.badges,
      username: member.username,
      data: user.data,
      mamadas: user.mamadas,
      mamou: user.mamou,
    };

    const i18nData = {
      aboutme: t('commands:profile.about-me'),
      mamado: t('commands:profile.mamado'),
      mamou: t('commands:profile.mamou'),
      zero: t('commands:profile.zero'),
      um: t('commands:profile.um'),
      dois: t('commands:profile.dois'),
      tres: t('commands:profile.tres'),
    };

    const res = await NewHttp.profileRequest(userSendData, marry, usageCommands, i18nData);

    if (res.err) return message.menheraReply('error', t('commands:http-error'));

    message.channel.send(message.author, new MessageAttachment(Buffer.from(res.data), 'profile.png'));
  }
};
