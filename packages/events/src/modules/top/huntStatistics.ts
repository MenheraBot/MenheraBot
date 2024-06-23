import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { calculateSkipCount, createPaginationButtons, usersToIgnoreInTop } from './index';
import { InteractionContext } from '../../types/menhera';
import { ApiHuntingTypes } from '../hunt/types';
import cacheRepository from '../../database/repositories/cacheRepository';
import { getTopHunters } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { COLORS } from '../../structures/constants';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { createActionRow, createButton } from '../../utils/discord/componentUtils';
import userRepository from '../../database/repositories/userRepository';
import titlesRepository from '../../database/repositories/titlesRepository';

const executeTopHuntStatistics = async (
  ctx: InteractionContext,
  type: ApiHuntingTypes,
  topMode: 'success',
  page: number,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await usersToIgnoreInTop();

  const results = await getTopHunters(skip, usersToIgnore, type, topMode);

  if (!results)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'common:api-error'),
      embeds: [],
      components: [],
    });

  const embed = createEmbed({
    title: ctx.locale('commands:top.estatisticas.cacar.title', {
      type: ctx.locale(`commands:top.estatisticas.cacar.${type}`),
      page: page > 1 ? page : 1,
      emoji: ctx.safeEmoji(`${type}s` as 'ok', true),
    }),
    description: ctx.locale(`commands:top.estatisticas.cacar.description.${topMode}`),
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
      if (member.username.startsWith('deleted_user_'))
        cacheRepository.addDeletedAccount([`${member.id}`]);
    }

    const userData = results[i];

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${member ? getDisplayName(member) : `ID ${userData.user_id}`}`,
      value: `${ctx.locale('commands:top.estatisticas.cacar.description.text', {
        hunted: userData[`${type}_hunted`],
        success: userData[`${type}_success`],
        tries: userData[`${type}_tries`],
      })}${translatedTitle ? `\n> ${translatedTitle}` : ''}`,
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
