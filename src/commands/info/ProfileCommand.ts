import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IUserDataToProfile } from '@custom_types/Menhera';
import HttpRequests from '@utils/HTTPrequests';
import { MessageAttachment } from 'discord.js-light';
import { debugError, toWritableUTF } from '@utils/Util';
import { VangoghRoutes, requestVangoghImage } from '@utils/VangoghRequests';

export default class ProfileCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'perfil',
      nameLocalizations: { 'en-US': 'profile' },
      description: '「✨」・Mostra o perfil de algúem',
      descriptionLocalizations: { 'en-US': "「✨」・Show someone's profile" },
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para mostrar o perfil',
          descriptionLocalizations: { 'en-US': 'User to show profile' },
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
      color: user.selectedColor,
      avatar,
      votes: user.votes,
      info: user.info,
      tag: toWritableUTF(member.tag),
      badges: user.badges,
      username: toWritableUTF(member.username),
      marryDate: user.marriedDate as string,
      mamadas: user.mamado,
      mamou: user.mamou,
      hiddingBadges: user.hiddingBadges,
      marry: null,
      married: false,
    };

    if (marry) {
      userSendData.married = true;
      userSendData.marry = {
        username: toWritableUTF(marry.username),
        tag: `${toWritableUTF(marry.username)}#${marry.discriminator}`,
      };
    }

    const i18nData = {
      aboutme: ctx.locale('commands:perfil.about-me'),
      mamado: ctx.locale('commands:perfil.mamado'),
      mamou: ctx.locale('commands:perfil.mamou'),
      usages: usageCommands
        ? ctx.locale('commands:perfil.commands-usage', {
            user: toWritableUTF(member.username),
            usedCount: usageCommands.cmds.count,
            mostUsedCommandName: usageCommands.array[0].name,
            mostUsedCommandCount: usageCommands.array[0].count,
          })
        : ctx.locale('commands:perfil.api-down'),
    };

    const profileTheme = await ctx.client.repositories.themeRepository.getProfileTheme(member.id);

    const res = await requestVangoghImage(
      VangoghRoutes.Profile,
      { user: userSendData, i18n: i18nData, type: profileTheme },
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
