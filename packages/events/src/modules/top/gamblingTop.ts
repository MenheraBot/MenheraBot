import cacheRepository from '../../database/repositories/cacheRepository';
import { COLORS } from '../../structures/constants';
import { ApiGamblingGameCompatible } from '../../types/api';
import { InteractionContext } from '../../types/menhera';
import { getTopGamblingUsers } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import {
  calculateSkipCount,
  createPaginationButtons,
  topEmojis,
  usersToIgnoreInTop,
} from './index';

const executeGamblingTop = async (
  ctx: InteractionContext,
  gameMode: ApiGamblingGameCompatible,
  topMode: 'money',
  page: number,
  finishCommand: () => void,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await usersToIgnoreInTop();

  const results = await getTopGamblingUsers(skip, usersToIgnore, topMode, gameMode);

  if (!results) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.locale('commands:top.estatisticas.apostas.title', {
      type: ctx.locale(`commands:top.estatisticas.apostas.${gameMode}`),
      page: page > 1 ? page : 1,
      emoji: topEmojis[gameMode],
    }),
    description: ctx.locale(`commands:top.estatisticas.apostas.description.${topMode}`),
    color: COLORS.Pinkie,
    fields: [],
  });

  const members = await Promise.all(
    results.map((a) => cacheRepository.getDiscordUser(`${a.user_id}`, page <= 3)),
  );

  for (let i = 0; i < results.length; i++) {
    const member = members[i];

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };

      if (member.username.startsWith('Deleted Account'))
        cacheRepository.addDeletedAccount([`${member.id}`]);
    }

    const userData = results[i];

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${member ? getDisplayName(member) : `ID ${results[i].user_id}`}`,
      value: ctx.locale('commands:top.estatisticas.apostas.description.text', {
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
      }),
      inline: false,
    });
  }

  const pagination = createPaginationButtons(ctx, 'gambling', gameMode, topMode, page);

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
  finishCommand();
};

export { executeGamblingTop };
