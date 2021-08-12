import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IUserDataToProfile, IUserSchema } from '@utils/Types';
import HttpRequests from '@utils/HTTPrequests';
import { MessageAttachment, User } from 'discord.js';

export default class ProfileInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'perfil',
      description: '「✨」・Mostra o perfil de algúem',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para mostrar o perfil',
          required: false,
        },
      ],
      category: 'info',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    let { user }: { user: IUserSchema | null } = ctx.data;
    const member = ctx.options.getUser('user') ?? ctx.interaction.user;
    let marry: string | User = 'false';

    if (member.id !== ctx.interaction.user.id) {
      if (member.bot) {
        await ctx.replyT('error', 'commands:profile.bot', {}, true);
        return;
      }
      user = await this.client.repositories.userRepository.find(member.id);
    }

    if (!user) {
      await ctx.replyT('error', 'commands:profile.no-dbuser', {}, true);
      return;
    }

    if (user.ban && ctx.interaction.user.id !== process.env.OWNER) {
      await ctx.replyT('error', 'commands:profile.banned', { reason: user.banReason }, true);
      return;
    }

    if (user?.casado !== 'false' && user?.casado)
      marry = await this.client.users.fetch(user.casado);

    await ctx.interaction.deferReply().catch(() => null);

    const avatar = member.displayAvatarURL({ format: 'png' });
    const usageCommands = await HttpRequests.getProfileCommands(member.id);

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

    const res = await HttpRequests.profileRequest(userSendData, marry, usageCommands, i18nData);

    if (res.err) {
      await ctx.deferedReplyT('error', 'commands:http-error');
      return;
    }

    await ctx.editReply({
      files: [new MessageAttachment(Buffer.from(res.data as Buffer), 'profile.png')],
    });
  }
}
