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
import { createCommand } from '../../structures/command/createCommand';
import { getUserProfileInfo } from '../../utils/apiRequests/statistics';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { getEnviroments } from '../../utils/getEnviroments';
import { toWritableUtf } from '../../utils/miscUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';

interface VangoghUserprofileData {
  id: string;
  color: string;
  image: number;
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

    if (user.ban && `${ctx.author.id}` !== getEnviroments(['OWNER_ID']).OWNER_ID) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.banned', { reason: user.banReason }),
        flags: MessageFlags.EPHEMERAL,
      });

      return finishCommand();
    }

    await ctx.defer();

    const marryData =
      user.married && user.married !== 'false'
        ? await cacheRepository.getDiscordUser(user.married)
        : null;

    const avatar = getUserAvatar(discordUser, { size: 512 });
    const usageCommands = await getUserProfileInfo(discordUser.id);

    const i18n = {
      aboutme: ctx.locale('commands:perfil.about-me'),
      mamado: ctx.locale('commands:perfil.mamado'),
      mamou: ctx.locale('commands:perfil.mamou'),
      usages: usageCommands
        ? ctx.locale('commands:perfil.commands-usage', {
            user: toWritableUtf(discordUser.username),
            usedCount: usageCommands.cmds.count,
            mostUsedCommandName: usageCommands.array[0]?.name ?? '??',
            mostUsedCommandCount: usageCommands.array[0]?.count ?? '??',
          })
        : ctx.locale('commands:perfil.api-down'),
    };

    const userThemes = await userThemesRepository.findEnsuredUserThemes(discordUser.id);

    const userData: VangoghUserprofileData = {
      id: user.id,
      color: user.selectedColor,
      image: userThemes.selectedImage,
      avatar,
      votes: user.votes,
      info: user.info,
      tag: toWritableUtf(getDisplayName(discordUser)),
      badges: getUserBadges(user, discordUser).map((a) => a.id),
      username: toWritableUtf(discordUser.username),
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
        username: toWritableUtf(marryData.username),
        tag: toWritableUtf(getDisplayName(marryData)),
      };

      if (user.marriedAt && user.marriedAt > 0)
        userData.marryDate = dayjs(user.marriedAt).format('DD/MM/YYYY');
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
          blob: imageFromRedis as unknown as Blob,
        },
      });

      finishCommand();
      return;
    }

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
