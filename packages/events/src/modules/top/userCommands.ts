import { calculateSkipCount, createPaginationButtons, usersToIgnoreInTop } from '.';
import cacheRepository from '../../database/repositories/cacheRepository';
import titlesRepository from '../../database/repositories/titlesRepository';
import userRepository from '../../database/repositories/userRepository';
import { InteractionContext } from '../../types/menhera';
import { getTopUsersByUses } from '../../utils/apiRequests/statistics';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';

const executeUserCommandsTop = async (
  ctx: InteractionContext,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await usersToIgnoreInTop();
  const res = await getTopUsersByUses(skip, usersToIgnore);

  if (!res || res.length === 0)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'common:api-error'),
      components: [],
      embeds: [],
    });

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.users', { page: page > 1 ? page : 1 }),
    color: hexStringToNumber(embedColor),
    fields: [],
  });

  const [members, titles] = await Promise.all([
    Promise.all(res.map(async (a) => cacheRepository.getDiscordUser(`${a.id}`))),
    Promise.all(res.map(async (a) => userRepository.ensureFindUser(`${a.id}`))),
  ]);

  const resolvedTitles = await Promise.all(
    titles.map(async (a) => ({
      text: await titlesRepository.getTitleInfo(a.currentTitle),
      id: a.currentTitle,
    })),
  );

  for (let i = 0; i < res.length; i++) {
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
        cacheRepository.addDeletedAccount([res[i].id]);
    }

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${member ? getDisplayName(member) : `ID ${res[i].id}`}`,
      value: `${ctx.locale('commands:top.used-commands', { times: res[i].uses })}${
        translatedTitle ? `\n> ${translatedTitle}` : ''
      }`,
      inline: false,
    });
  }

  const pagination = createPaginationButtons(ctx, 'users', embedColor, 'NONE', page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUserCommandsTop };
