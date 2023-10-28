import { ButtonStyles } from 'discordeno/types';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import cacheRepository from '../../database/repositories/cacheRepository';
import { COLORS } from '../../structures/constants';
import { ApiGamblingGameCompatible } from '../../types/api';
import { InteractionContext } from '../../types/menhera';
import { getTopGamblingUsers } from '../../utils/apiRequests/statistics';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { calculateSkipCount, topEmojis } from './index';

const executeGamblingTop = async (
  ctx: InteractionContext,
  gameMode: ApiGamblingGameCompatible,
  topMode: 'money',
  page: number,
  finishCommand: () => void,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await Promise.all([
    blacklistRepository.getAllBannedUsersId(),
    cacheRepository.getDeletedAccounts(),
  ]).then((a) => a[0].concat(a[1]));

  const results = await getTopGamblingUsers(skip, usersToIgnore, topMode, gameMode);

  if (!results) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });

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

  const backButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
      'gambling',
      gameMode,
      topMode,
      page === 0 ? 1 : page - 1,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:back'),
    disabled: page < 2,
  });

  const nextButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
      'gambling',
      gameMode,
      topMode,
      page === 0 ? 2 : page + 1,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:next'),
    disabled: page === 100,
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([backButton, nextButton])] });
  finishCommand();
};

export { executeGamblingTop };
