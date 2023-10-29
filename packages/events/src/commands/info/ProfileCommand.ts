import dayjs from 'dayjs';
import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes } from 'discordeno/types';
import md5 from 'md5';

import { bot } from '../..';
import { VangoghRedisClient } from '../../database/databases';
import cacheRepository from '../../database/repositories/cacheRepository';
import userRepository from '../../database/repositories/userRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { getUserBadges } from '../../modules/badges/getUserBadges';
import { getThemesByType } from '../../modules/themes/getThemes';
import { ProfileTheme } from '../../modules/themes/types';
import { getProfileImageUrl } from '../../structures/cdnManager';
import { createCommand } from '../../structures/command/createCommand';
import { getUserProfileInfo } from '../../utils/apiRequests/statistics';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import eventRepository from '../../database/repositories/eventRepository';
import { Tricks } from '../event/TrickOrTreatsCommand';
import { randomFromArray } from '../../utils/miscUtils';
import { availableAuthors } from '../fun/CalvoCommand';

interface VangoghUserprofileData {
  id: string;
  color: string;
  image: string;
  avatar: string;
  votes: number;
  info: string;
  tag: string;
  badges: Array<number>;
  hiddingBadges: Array<number>;
  username: string;
  marryDate: string;
  mamadas: number;
  mamou: number;
  marry: {
    username: string;
    tag: string;
  } | null;
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
        flags: MessageFlags.EPHEMERAL,
      });

      return finishCommand();
    }

    const userTrick = await eventRepository.getUserTrick(user.id);

    if (userTrick === Tricks.BANNED_ON_PROFILE && user.id !== `${ctx.author.id}`) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.banned', {
          reason: 'Esse usuário está sendo zoado pelos seus vizinhos em uma travessura',
        }),
        flags: MessageFlags.EPHEMERAL,
      });

      return finishCommand();
    }

    if (userTrick === Tricks.CHANGE_COLOR)
      user.selectedColor = Math.random() < 0.5 ? '#eb6123' : '#215D1F';

    await ctx.defer();

    const isMarryTrick = userTrick === Tricks.OTHER_MARRY;

    const marryData =
      user.married && user.married !== 'false' && !isMarryTrick
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

    const userData: VangoghUserprofileData = {
      id: user.id,
      color: user.selectedColor,
      image: getProfileImageUrl(userThemes.selectedImage),
      avatar,
      votes: user.votes,
      info: user.info,
      tag: getDisplayName(discordUser, true),
      badges:
        userTrick === Tricks.NO_BADGES ? [] : getUserBadges(user, discordUser).map((a) => a.id),
      username: getDisplayName(discordUser, true),
      marryDate: user.marriedDate as string,
      mamadas: user.mamado,
      mamou: user.mamou,
      hiddingBadges: user.hiddingBadges,
      marry: null,
      married: false,
    };

    if (marryData) {
      userData.married = true;
      userData.marry = {
        username: getDisplayName(marryData, true),
        tag: getDisplayName(marryData, true),
      };

      if (user.marriedAt && user.marriedAt > 0)
        userData.marryDate = dayjs(user.marriedAt).format('DD/MM/YYYY');
    }

    if (isMarryTrick) {
      const newMarry = randomFromArray([
        'Xandão do Supremo',
        'Kin Kardashian',
        'Zeus',
        'Medusa',
        'Nox',
        'Ah Puch',
        'Alune',
        'Veigar',
        'Ivern',
        'Heimerdinger',
        'Malzahar',
        'Ramus',
        'Sivir',
        'Urgot',
        'Zoe',
        'Kukulcán',
        ...availableAuthors,
      ]);

      userData.married = true;
      userData.marry = {
        username: newMarry,
        tag: newMarry,
      };

      userData.marryDate = '16/02/2004';
    }

    let profileTheme = await userThemesRepository.getProfileTheme(discordUser.id);
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
        file: {
          name: 'profile.png',
          blob: new Blob([Buffer.from(imageFromRedis, 'base64')], {
            encoding: 'base64',
            type: 'image/png',
          }),
        },
      });

      finishCommand();
      return;
    }

    const usageCommands = await getUserProfileInfo(`${discordUser.id}`);

    if (usageCommands)
      i18n.usages = ctx.locale('commands:perfil.commands-usage', {
        user: getDisplayName(discordUser, true),
        usedCount: usageCommands.totalUses,
        mostUsedCommandName: usageCommands.topCommand.name,
        mostUsedCommandCount: usageCommands.topCommand.uses,
      });

    if (discordUser.id === bot.applicationId)
      // eslint-disable-next-line no-bitwise
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
      file: {
        name: 'profile.png',
        blob: res.data,
      },
    });

    finishCommand();
  },
});

export default ProfileCommand;
