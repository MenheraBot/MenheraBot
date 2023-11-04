import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import {
  calculateSkipCount,
  createPaginationButtons,
  topEmojis,
  usersToIgnoreInTop,
} from './index';
import { InteractionContext } from '../../types/menhera';
import { ApiHuntingTypes } from '../hunt/types';
import cacheRepository from '../../database/repositories/cacheRepository';
import { getTopHunters } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { COLORS } from '../../structures/constants';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { createActionRow, createButton } from '../../utils/discord/componentUtils';

const executeTopHuntStatistics = async (
  ctx: InteractionContext,
  type: ApiHuntingTypes,
  topMode: 'success',
  page: number,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await usersToIgnoreInTop();

  const results = await getTopHunters(skip, usersToIgnore, type, topMode);

  if (!results) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

    return;
  }

  const embed = createEmbed({
    title: ctx.locale('commands:top.estatisticas.cacar.title', {
      type: ctx.locale(`commands:top.estatisticas.cacar.${type}`),
      page: page > 1 ? page : 1,
      emoji: topEmojis[`${type}s`],
    }),
    description: ctx.locale(`commands:top.estatisticas.cacar.description.${topMode}`),
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
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([`${member.id}`]);
    }

    const userData = results[i];

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${member ? getDisplayName(member) : `ID ${userData.user_id}`}`,
      value: ctx.locale('commands:top.estatisticas.cacar.description.text', {
        hunted: userData[`${type}_hunted`],
        success: userData[`${type}_success`],
        tries: userData[`${type}_tries`],
      }),
      inline: true,
    });
  }

  const [back, next] = createPaginationButtons(ctx, 'hunt', type, topMode, page)
    .components as ButtonComponent[];

  const weeklyRank = createButton({
    style: ButtonStyles.Link,
    label: ctx.locale('commands:top.estatisticas.cacar.weekly'),
    url: 'https://menherabot.xyz/?utm_source=discord&utm_medium=button_component#ranking',
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([back, weeklyRank, next])] });
};

export { executeTopHuntStatistics };