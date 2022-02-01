import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IUserDataToProfile } from '@utils/Types';
import HttpRequests from '@utils/HTTPrequests';
import { MessageAttachment } from 'discord.js-light';
import { debugError, toWritableUTF } from '@utils/Util';

export default class ProfileInteractionCommand extends InteractionCommand {
  constructor() {
    super({
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
      authorDataFields: [
        'married',
        'selectedColor',
        'votes',
        'info',
        'voteCooldown',
        'badges',
        'marriedDate',
        'mamado',
        'mamou',
        'ban',
        'banReason',
      ],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const member = ctx.options.getUser('user') ?? ctx.author;

    const user =
      member.id !== ctx.author.id
        ? await ctx.client.repositories.userRepository.find(member.id, [
            'married',
            'selectedColor',
            'votes',
            'info',
            'voteCooldown',
            'badges',
            'marriedDate',
            'mamado',
            'mamou',
            'ban',
            'banReason',
          ])
        : ctx.data.user;

    if (!user) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.no-dbuser'),
        ephemeral: true,
      });
      return;
    }

    if (user.ban && ctx.author.id !== process.env.OWNER) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.banned', { reason: user.banReason }),
        ephemeral: true,
      });
      return;
    }

    const marry =
      user.married && user.married !== 'false'
        ? await ctx.client.users.fetch(user.married).catch(debugError)
        : null;

    if (marry) marry.username = toWritableUTF(marry?.username);

    await ctx.defer();

    const avatar = member.displayAvatarURL({ format: 'png', size: 512 });
    const usageCommands = await HttpRequests.getProfileCommands(member.id);

    const userSendData: IUserDataToProfile = {
      cor: user.selectedColor,
      avatar,
      votos: user.votes,
      nota: user.info,
      tag: toWritableUTF(member.tag),
      flagsArray: member.flags?.toArray() ?? [],
      casado: user.married,
      voteCooldown: user.voteCooldown as number,
      badges: user.badges,
      username: toWritableUTF(member.username),
      data: user.marriedDate as string,
      mamadas: user.mamado,
      mamou: user.mamou,
    };

    const i18nData = {
      aboutme: ctx.locale('commands:perfil.about-me'),
      mamado: ctx.locale('commands:perfil.mamado'),
      mamou: ctx.locale('commands:perfil.mamou'),
      zero: ctx.locale('commands:perfil.zero'),
      um: ctx.locale('commands:perfil.um'),
      dois: ctx.locale('commands:perfil.dois'),
      tres: ctx.locale('commands:perfil.tres'),
    };

    const profileTheme = await ctx.client.repositories.themeRepository.getProfileTheme(member.id);

    const res = ctx.client.picassoWs.isAlive
      ? await ctx.client.picassoWs.makeRequest({
          id: ctx.interaction.id,
          type: 'profile',
          data: { user: userSendData, marry, usageCommands, i18n: i18nData, type: profileTheme },
        })
      : await HttpRequests.profileRequest(
          userSendData,
          marry,
          usageCommands,
          i18nData,
          profileTheme,
        );

    if (res.err) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
      return;
    }

    await ctx.makeMessage({
      files: [new MessageAttachment(res.data, 'profile.png')],
    });
  }
}
