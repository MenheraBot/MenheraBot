import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IUserDataToProfile } from '@custom_types/Menhera';
import HttpRequests from '@utils/HTTPrequests';
import { MessageAttachment } from 'discord.js-light';
import { debugError, toWritableUTF } from '@utils/Util';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class ProfileCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'profile',
      nameLocalizations: { 'pt-BR': 'perfil' },
      description: "「✨」・Show someone's profile",
      descriptionLocalizations: { 'pt-BR': '「✨」・Mostra o perfil de algúem' },
      options: [
        {
          name: 'user',
          nameLocalizations: { 'pt-BR': 'usuário' },
          type: 'USER',
          description: 'User to show profile',
          descriptionLocalizations: { 'pt-BR': 'Usuário para mostrar o perfil' },
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
        'hiddingBadges',
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
            'hiddingBadges',
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

    await ctx.defer();

    const marry =
      user.married && user.married !== 'false'
        ? await ctx.client.users.fetch(user.married).catch(debugError)
        : null;

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
      hiddingBadges: user.hiddingBadges,
      marry: null,
    };

    if (marry) {
      userSendData.marry = {
        username: toWritableUTF(marry.username),
        tag: `${toWritableUTF(marry.username)}#${marry.discriminator}`,
      };
    }

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

    const res = await requestPicassoImage(
      PicassoRoutes.Profile,
      { user: userSendData, usageCommands, i18n: i18nData, type: profileTheme },
      ctx,
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
