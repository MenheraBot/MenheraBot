import { calculateSkipCount, createPaginationButtons, usersToIgnoreInTop } from './index.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import farmerRepository from '../../database/repositories/farmerRepository.js';
import titlesRepository from '../../database/repositories/titlesRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import { InteractionContext } from '../../types/menhera.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils.js';

const executeFarmersExperienceTop = async (
  ctx: InteractionContext,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);
  const usersToIgnore = await usersToIgnoreInTop();

  const res = await farmerRepository.getTopRanking(skip, usersToIgnore);

  const embed = createEmbed({
    title: ctx.prettyResponse('four_leaf', 'commands:top.fazendeiros.experience-title', {
      page: page > 1 ? page : 1,
    }),
    color: hexStringToNumber(embedColor),
    fields: [],
  });

  const [members, titles] = await Promise.all([
    Promise.all(res.map((a) => cacheRepository.getDiscordUser(`${a.id}`))),
    Promise.all(res.map((a) => userRepository.ensureFindUser(`${a.id}`))),
  ]);

  const resolvedTitles = await Promise.all(
    titles.map(async (a) => ({
      text: await titlesRepository.getTitleInfo(a.currentTitle),
      id: a.currentTitle,
    })),
  );

  for (let i = 0; i < res.length; i++) {
    const member = members[i];
    const memberName = member ? getDisplayName(member) : `ID ${res[i].id}`;
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
        cacheRepository.addDeletedAccount([`${res[i].id}`]);
    }

    embed.fields?.push({
      name: `**${skip + 1 + i} -** ${memberName}`,
      value: `${ctx.locale('commands:top.fazendeiros.experience')}: **${res[i].value}**${
        translatedTitle ? `\n> ${translatedTitle}` : ''
      }`,
      inline: false,
    });
  }

  const actionRows = createPaginationButtons(ctx, 'farmers', embedColor, 'EXPERIENCE', page);

  ctx.makeMessage({
    embeds: [embed],
    components: [actionRows],
  });
};

export { executeFarmersExperienceTop };
