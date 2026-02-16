import { ApplicationCommandOptionTypes } from '@discordeno/bot';
import md5 from 'md5';

import { bot } from '../../index.js';
import { VangoghRedisClient } from '../../database/databases.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import userThemesRepository from '../../database/repositories/userThemesRepository.js';
import { getUserBadges } from '../../modules/badges/getUserBadges.js';
import { getThemeById, getThemesByType } from '../../modules/themes/getThemes.js';
import { ProfileTheme } from '../../modules/themes/types.js';
import { getProfileImageUrl } from '../../structures/cdnManager.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { getUserProfileInfo } from '../../utils/apiRequests/statistics.js';
import { MessageFlags } from '@discordeno/bot';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils.js';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest.js';
import titlesRepository from '../../database/repositories/titlesRepository.js';
import { User } from '../../types/discordeno.js';

export interface VangoghUserprofileData {
  id: string;
  color: string;
  image: string;
  avatar: string;
  votes: number;
  info: string;
  badges: number[];
  hiddingBadges: number[];
  username: string;
  mamadas: number;
  mamou: number;
  marryUsername: string;
  marryDate: string;
  title: string;
  married: boolean;
}

const ProfileCommand = createCommand({
  path: '',
  name: 'perfil',
  nameLocalizations: { 'en-US': 'profile' },
  description: '「✨」・Mostra o perfil de algúem',
  descriptionLocalizations: { 'en-US': "「✨」・Show someone's profile" },
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário para mostrar o perfil',
      descriptionLocalizations: { 'en-US': 'User to show profile' },
      required: false,
    },
  ],
  category: 'info',
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
  execute: async (ctx, finishCommand) => {
    const discordUser = ctx.getOption<User>('user', 'users') ?? ctx.author;

    const user =
      discordUser.id !== ctx.author.id
        ? await userRepository.ensureFindUser(discordUser.id)
        : ctx.authorData;

    if (user.ban && ctx.author.id !== bot.ownerId) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.banned', { reason: user.banReason }),
        flags: MessageFlags.Ephemeral,
      });

      return finishCommand();
    }

    await ctx.defer();

    const marryData =
      user.married && user.married !== 'false'
        ? await cacheRepository.getDiscordUser(user.married)
        : null;

    const avatar = getUserAvatar(discordUser, { size: 512 });

    const i18n = {
      aboutme: ctx.locale('commands:perfil.about-me'),
      mamado: ctx.locale('commands:perfil.mamado'),
      mamou: ctx.locale('commands:perfil.mamou'),
      usages: ctx.locale('commands:perfil.api-down'),
    };

    const userThemes = await userThemesRepository.findEnsuredUserThemes(discordUser.id);
    const profileThemeFile = getThemeById<ProfileTheme>(userThemes.selectedProfileTheme);

    const userTitle =
      user.currentTitle === 0 ? null : await titlesRepository.getTitleInfo(user.currentTitle);

    const userData: VangoghUserprofileData = {
      id: user.id,
      color: user.selectedColor,
      image: getProfileImageUrl(userThemes.selectedImage, bot),
      avatar,
      votes: user.votes,
      info: user.info,
      badges: getUserBadges(user, discordUser).map((a) => a.id),
      username: getDisplayName(discordUser, true),
      mamadas: user.mamado,
      mamou: user.mamou,
      hiddingBadges: user.hiddingBadges,
      marryUsername: '',
      marryDate: user.marriedDate ?? '',
      title: userTitle ? (userTitle.textLocalizations?.[ctx.interactionLocale] ?? userTitle.text) : '',
      married: false,
    };

    if (marryData) {
      userData.married = true;
      userData.marryUsername = getDisplayName(marryData, true);

      if (user.marriedAt && user.marriedAt > 0)
        userData.marryDate = Intl.DateTimeFormat(ctx.interactionLocale, { dateStyle: 'short' }).format(
          user.marriedAt,
        );
    }

    let profileTheme = profileThemeFile.data.theme;

    let customEdits: string[] = userThemes.customizedProfile ?? [];

    if (discordUser.id === bot.applicationId) {
      const existingProfileThemes = getThemesByType<ProfileTheme>('profile');

      const profileIndex = new Date().getDate() % existingProfileThemes.length;

      const randomTheme = existingProfileThemes[profileIndex];

      profileTheme = randomTheme.data.theme;

      if (randomTheme.data.customEdits && randomTheme.data.customEdits.length > 0)
        customEdits = randomTheme.data.customEdits.map((a) => [a, 'false']).flat();
    }

    const hashedData = md5(`${profileTheme}-${customEdits.join(',')}-${JSON.stringify(userData)}`);

    const fromRedis = await VangoghRedisClient.get(`profile:${user.id}:hash`);

    if (fromRedis && fromRedis === hashedData) {
      const imageFromRedis = await VangoghRedisClient.get(`profile:${user.id}:image`);

      if (!imageFromRedis) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
        return finishCommand();
      }

      await ctx.makeMessage({
        files: [
          {
            name: 'profile.png',
            blob: new Blob([Buffer.from(imageFromRedis, 'base64')], {
              type: 'image/png',
            }),
          },
        ],
      });

      finishCommand();
      return;
    }

    if (profileThemeFile.data.needApiData) {
      const usageCommands = await getUserProfileInfo(`${discordUser.id}`);

      if (usageCommands)
        i18n.usages = ctx.locale('commands:perfil.commands-usage', {
          user: getDisplayName(discordUser, true),
          usedCount: usageCommands.totalUses,
          count: usageCommands.totalUses,
          mostUsedCommandName: usageCommands.topCommand.name,
          mostUsedCommandCount: usageCommands.topCommand.uses,
        });
    }

    if (discordUser.id === bot.applicationId)
      userData.color = `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')}`;

    const res = await vanGoghRequest(VanGoghEndpoints.Profile, {
      user: userData,
      i18n,
      hashedData,
      type: profileTheme,
      customEdits,
    });

    if (res.err) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
      return finishCommand();
    }

    await ctx.makeMessage({
      files: [
        {
          name: 'profile.png',
          blob: res.data,
        },
      ],
    });

    finishCommand();
  },
});

export default ProfileCommand;
