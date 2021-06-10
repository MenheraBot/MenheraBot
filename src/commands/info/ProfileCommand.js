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

  async run(ctx) {
    const authorData = ctx.data.user;
    const userId = Util.getIdByMention(ctx.args[0]);

    let user = authorData;
    let member = ctx.message.author;
    let marry = 'false';

    if (userId && userId !== ctx.message.author) {
      try {
        member = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
        if (member.bot) return ctx.replyT('error', 'commands:profile.bot');

        user = await this.client.database.repositories.userRepository.find(member.id);
      } catch {
        return ctx.replyT('error', 'commands:profile.unknow-user');
      }
    }
    if (user?.casado !== 'false' && user?.casado) marry = await this.client.users.fetch(user.casado);

    if (!user) return ctx.replyT('error', 'commands:profile.no-dbuser');
    if (user.ban && ctx.message.author.id !== process.env.OWNER) return ctx.replyT('error', 'commands:profile.banned', { reason: user.banReason });

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
      aboutme: ctx.locale('commands:profile.about-me'),
      mamado: ctx.locale('commands:profile.mamado'),
      mamou: ctx.locale('commands:profile.mamou'),
      zero: ctx.locale('commands:profile.zero'),
      um: ctx.locale('commands:profile.um'),
      dois: ctx.locale('commands:profile.dois'),
      tres: ctx.locale('commands:profile.tres'),
    };

    const res = await NewHttp.profileRequest(userSendData, marry, usageCommands, i18nData);

    if (res.err) return ctx.replyT('error', 'commands:http-error');

    ctx.sendC(ctx.message.author, new MessageAttachment(Buffer.from(res.data), 'profile.png'));
  }
};
