import { ApplicationCommandOptionTypes } from 'discordeno/types';
import { User } from 'discordeno/transformers';
import dayjs from 'dayjs';
import md5 from 'md5';

import userRepository from '../../database/repositories/userRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getEnviroments } from '../../utils/getEnviroments';
import cacheRepository from '../../database/repositories/cacheRepository';
import { getUserAvatar } from '../../utils/discord/userUtils';
import { getUserProfileInfo } from '../../utils/apiRequests/statistics';
import { toWritableUtf } from '../../utils/miscUtils';
import { getUserBadges } from '../../modules/badges/getUserBadges';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { createCommand } from '../../structures/command/createCommand';
import { VangoghRedisClient } from '../../database/databases';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';

interface VangoghUserprofileData {
  id: string;
  color: string;
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

    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:perfil.no-dbuser'),
        flags: MessageFlags.EPHEMERAL,
      });

      return finishCommand();
    }

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

    const userData: VangoghUserprofileData = {
      id: user.id,
      color: user.selectedColor,
      avatar,
      votes: user.votes,
      info: user.info,
      tag: toWritableUtf(`${discordUser.username}#${discordUser.discriminator}`),
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
        tag: `${toWritableUtf(marryData.username)}#${marryData.discriminator}`,
      };

      if (user.marriedAt && user.marriedAt > 0)
        userData.marryDate = dayjs(user.marriedAt).format('DD/MM/YYYY');
    }

    const profileTheme = await userThemesRepository.getProfileTheme(discordUser.id);

    const hashedData = md5(`${profileTheme}-${JSON.stringify(userData)}`);

    const fromRedis = await VangoghRedisClient.get(`profile:${user.id}:hash`);

    const embed = createEmbed({
      title: '🎁 | 3 Anos de Menhera',
      image: { url: 'attachment://profile.png' },
      color: hexStringToNumber(user.selectedColor),
    });

    if (fromRedis && fromRedis === hashedData) {
      const imageFromRedis = await VangoghRedisClient.get(`profile:${user.id}:image`);

      if (!imageFromRedis) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
        return finishCommand();
      }

      await ctx.makeMessage({
        embeds: [embed],
        file: {
          name: 'profile.png',
          blob: imageFromRedis as unknown as Blob,
        },
      });

      finishCommand();
      return;
    }

    const res = await vanGoghRequest(VanGoghEndpoints.Profile, {
      user: userData,
      i18n,
      hashedData,
      type: profileTheme,
    });

    if (res.err) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });
      return finishCommand();
    }

    await ctx.makeMessage({
      embeds: [embed],
      file: {
        name: 'profile.png',
        blob: res.data,
      },
    });

    finishCommand();
  },
});

export default ProfileCommand;
