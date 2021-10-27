import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IUserDataToProfile, IUserSchema } from '@utils/Types';
import HttpRequests from '@utils/HTTPrequests';
import { MessageAttachment, User } from 'discord.js-light';

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
      authorDataFields: [
        'ban',
        'banReason',
        'casado',
        'cor',
        'votos',
        'nota',
        'voteCooldown',
        'badges',
        'data',
        'mamadas',
        'mamou',
      ],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    let { user }: { user: IUserSchema | null } = ctx.data;
    const member = ctx.options.getUser('user') ?? ctx.author;
    let marry: string | User = 'false';

    if (member.id !== ctx.author.id) {
      if (member.bot) {
        await ctx.makeMessage({ content: ctx.prettyResponse('error', 'bot'), ephemeral: true });
        return;
      }
      user = await this.client.repositories.userRepository.find(member.id);
    }

    if (!user) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'no-dbuser'), ephemeral: true });
      return;
    }

    if (user.ban && ctx.author.id !== process.env.OWNER) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'banned', { reason: user.banReason }),
        ephemeral: true,
      });
      return;
    }

    if (user?.casado !== 'false' && user?.casado)
      marry = await this.client.users.fetch(user.casado);

    await ctx.defer();

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
      aboutme: ctx.translate('about-me'),
      mamado: ctx.translate('mamado'),
      mamou: ctx.translate('mamou'),
      zero: ctx.translate('zero'),
      um: ctx.translate('um'),
      dois: ctx.translate('dois'),
      tres: ctx.translate('tres'),
    };

    const res = this.client.picassoWs.isAlive
      ? await this.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'profile',
          data: { user: userSendData, marry, usageCommands, i18n: i18nData },
        })
      : await HttpRequests.profileRequest(userSendData, marry, usageCommands, i18nData);

    if (res.err) {
      await ctx.makeMessage({ content: ctx.prettyResponseLocale('error', 'commands:http-error') });
      return;
    }

    await ctx.makeMessage({
      files: [new MessageAttachment(res.data, 'profile.png')],
    });
  }
}
