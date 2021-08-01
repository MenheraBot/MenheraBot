import { MessageAttachment, User } from 'discord.js';
import Command from '@structures/Command';
import Util from '@utils/Util';
import http from '@utils/HTTPrequests';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import { IUserDataToProfile, IUserSchema } from '@utils/Types';

export default class ProfileCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'profile',
      aliases: ['perfil'],
      cooldown: 5,
      clientPermissions: ['ATTACH_FILES'],
      category: 'info',
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const userId = Util.getIdByMention(ctx.args[0]);

    let { user }: { user: IUserSchema | null } = ctx.data;
    let member = ctx.message.author;
    let marry: string | User = 'false';

    if (userId && userId !== ctx.message.author.id) {
      try {
        member = await this.client.users.fetch(ctx.args[0].replace(/[<@!>]/g, ''));
        if (member.bot) {
          await ctx.replyT('error', 'commands:profile.bot');
          return;
        }

        user = await this.client.repositories.userRepository.find(member.id);
      } catch {
        await ctx.replyT('error', 'commands:profile.unknow-user');
        return;
      }
    }
    if (!user) {
      await ctx.replyT('error', 'commands:profile.no-dbuser');
      return;
    }

    if (user.ban && ctx.message.author.id !== process.env.OWNER) {
      await ctx.replyT('error', 'commands:profile.banned', { reason: user.banReason });
      return;
    }

    if (user?.casado !== 'false' && user?.casado)
      marry = await this.client.users.fetch(user.casado);

    const avatar = member.displayAvatarURL({ format: 'png' });
    const usageCommands = await http.getProfileCommands(member.id);

    const userSendData: IUserDataToProfile = {
      cor: user.cor,
      avatar,
      votos: user.votos,
      nota: user.nota,
      tag: member.tag,
      flagsArray: member.flags?.toArray() ?? ['NONE'],
      casado: user.casado,
      voteCooldown: user.voteCooldown,
      badges: user.badges,
      username: member.username,
      data: user.data as string,
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

    const res = await http.profileRequest(userSendData, marry, usageCommands, i18nData);

    if (res.err) {
      await ctx.replyT('error', 'commands:http-error');
      return;
    }

    await ctx.sendC(ctx.message.author.toString(), {
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'profile.png')],
    });
  }
}
