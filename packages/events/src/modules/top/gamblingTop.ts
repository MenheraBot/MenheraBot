import cacheRepository from '../../database/repositories/cacheRepository';
import titlesRepository from '../../database/repositories/titlesRepository';
import userRepository from '../../database/repositories/userRepository';
import { COLORS } from '../../structures/constants';
import { ApiGamblingGameCompatible } from '../../types/api';
import { InteractionContext } from '../../types/menhera';
import { getTopGamblingUsers } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { calculateSkipCount, createPaginationButtons, usersToIgnoreInTop } from './index';

const executeGamblingTop = async (
  ctx: InteractionContext,
  gameMode: ApiGamblingGameCompatible,
  topMode: 'money',
  page: number,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await usersToIgnoreInTop();

  const results = await getTopGamblingUsers(skip, usersToIgnore, topMode, gameMode);

  if (!results)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'common:api-error'),
      embeds: [],
      components: [],
    });

  const embed = createEmbed({
    title: ctx.locale('commands:top.estatisticas.apostas.title', {
      type: ctx.locale(`commands:top.estatisticas.apostas.${gameMode}`),
      page: page > 1 ? page : 1,
      emoji: ctx.safeEmoji(gameMode as 'ok', true),
    }),
    description: ctx.locale(`commands:top.estatisticas.apostas.description.${topMode}`),
    color: COLORS.Pinkie,
    fields: [],
  });

  const [members, titles] = await Promise.all([
    Promise.all(results.map(async (a) => cacheRepository.getDiscordUser(`${a.user_id}`))),
    Promise.all(results.map(async (a) => userRepository.ensureFindUser(`${a.user_id}`))),
  ]);

  const resolvedTitles = await Promise.all(
    titles.map(async (a) => ({
      text: await titlesRepository.getTitleInfo(a.currentTitle),
      id: a.currentTitle,
    })),
  );

  for (let i = 0; i < results.length; i++) {
    const member = members[i];
    const rawTitle = resolvedTitles.find(
      (a) => a.id === titles.find((b) => b.id === `${member?.id}`)?.currentTitle,
    );

    const translatedTitle =
      ctx.guildLocale === 'en-US'
        ? rawTitle?.text?.textLocalizations?.['en-US']
        : rawTitle?.text?.text;

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };

      if (member.username.startsWith('Deleted Account'))
        cacheRepository.addDeletedAccount([`${member.id}`]);
    }

    const userData = results[i];

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${member ? getDisplayName(member) : `ID ${results[i].user_id}`}`,
      value: `${ctx.locale('commands:top.estatisticas.apostas.description.text', {
        earnMoney: userData.earn_money.toLocaleString(ctx.interaction.locale),
        lostMoney: userData.lost_money.toLocaleString(ctx.interaction.locale),
        lostGames: userData.lost_games,
        wonGames: userData.won_games,
        winPercentage:
          (((userData.won_games ?? 0) / (userData.won_games + userData.lost_games)) * 100).toFixed(
            2,
          ) || 0,
        lostPercentage:
          (((userData.lost_games ?? 0) / (userData.won_games + userData.lost_games)) * 100).toFixed(
            2,
          ) || 0,
      })}${translatedTitle ? `\n> ${translatedTitle}` : ''}`,
      inline: false,
    });
  }

  const pagination = createPaginationButtons(ctx, 'gambling', gameMode, topMode, page);

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeGamblingTop };
