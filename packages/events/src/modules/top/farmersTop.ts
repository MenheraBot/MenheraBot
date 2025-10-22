import { calculateSkipCount, createPaginationButtons, usersToIgnoreInTop } from './index.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import titlesRepository from '../../database/repositories/titlesRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import { InteractionContext } from '../../types/menhera.js';
import { getTopFarmers } from '../../utils/apiRequests/statistics.js';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils.js';
import { Plants } from '../fazendinha/constants.js';
import { AvailablePlants } from '../fazendinha/types.js';

const executeFarmersTop = async (
  ctx: InteractionContext,
  page: number,
  embedColor: string,
  plantType: AvailablePlants,
  orderBy: 'harvested' | 'rotten',
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await usersToIgnoreInTop();

  const res = await getTopFarmers(skip, usersToIgnore, plantType, orderBy);

  if (!res || res.length === 0)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'common:api-error'),
      embeds: [],
      components: [],
    });

  const embed = createEmbed({
    title: ctx.locale('commands:top.fazendeiros.title', {
      subtitle: ctx.locale(`commands:top.fazendeiros.subtitle-${orderBy}`),
      page: page > 1 ? page : 1,
      emoji: Plants[plantType].emoji,
      plant: ctx.locale(`data:plants.${plantType}`),
    }),
    color: hexStringToNumber(embedColor),
    fields: [],
  });

  const [members, titles] = await Promise.all([
    Promise.all(res.map((a) => cacheRepository.getDiscordUser(`${a.user_id}`))),
    Promise.all(res.map((a) => userRepository.ensureFindUser(`${a.user_id}`))),
  ]);

  const resolvedTitles = await Promise.all(
    titles.map(async (a) => ({
      text: await titlesRepository.getTitleInfo(a.currentTitle),
      id: a.currentTitle,
    })),
  );

  for (let i = 0; i < res.length; i++) {
    const member = members[i];
    const memberName = member ? getDisplayName(member) : `ID ${res[i].user_id}`;
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
        cacheRepository.addDeletedAccount([`${res[i].user_id}`]);
    }

    embed.fields?.push({
      name: `**${skip + 1 + i} -** ${memberName}`,
      value: `${ctx.locale('commands:top.fazendeiros.harvested')}: **${res[i].harvest}** ${
        Plants[plantType].emoji
      }\n${ctx.locale('commands:top.fazendeiros.rotten')}: **${res[i].rotted}** 🍂${
        translatedTitle ? `\n> ${translatedTitle}` : ''
      }`,
      inline: false,
    });
  }

  const buttons = createPaginationButtons(
    ctx,
    'farmers',
    embedColor,
    `${plantType}`,
    page,
    orderBy,
  );

  const selectMenu = createActionRow([
    createSelectMenu({
      customId: createCustomId(
        0,
        ctx.user.id,
        ctx.originalInteractionId,
        'farmers',
        embedColor,
        'CHANGE',
        page,
        orderBy,
      ),
      maxValues: 1,
      options: Object.keys(Plants).map((a) => ({
        label: ctx.locale(`data:plants.${a as '1'}`),
        value: a,
        emoji: { name: Plants[a as '1'].emoji },
        default: Number(a) === plantType,
      })),
    }),
  ]);

  ctx.makeMessage({
    embeds: [embed],
    components: [selectMenu, buttons],
  });
};

export { executeFarmersTop };
