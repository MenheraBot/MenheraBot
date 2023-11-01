import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { InteractionContext } from '../../types/menhera';
import { calculateSkipCount, createPaginationButtons, usersToIgnoreInTop } from '.';
import { getTopTaxesPaid } from '../../utils/apiRequests/statistics';
import cacheRepository from '../../database/repositories/cacheRepository';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';

const executePaidTaxesTop = async (
  ctx: InteractionContext,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);
  const res = await getTopTaxesPaid(skip, await usersToIgnoreInTop());

  if (!res || res.length === 0)
    return ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

  const embed = createEmbed({
    title: ctx.prettyResponse('wink', 'commands:top.estatisticas.impostos.taxes', {
      page: page > 1 ? page : 1,
    }),
    color: hexStringToNumber(embedColor),
    fields: [],
  });

  const members = await Promise.all(
    res.map((a) => cacheRepository.getDiscordUser(`${a.id}`, page <= 3)),
  );

  for (let i = 0; i < res.length; i++) {
    const member = members[i];

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([res[i].id]);
    }

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${member ? getDisplayName(member) : `ID ${res[i].id}`}`,
      value: ctx.locale('commands:top.estatisticas.impostos.paid', { value: res[i].taxes }),
      inline: false,
    });
  }

  const pagination = createPaginationButtons(ctx, 'imposto', embedColor, 'NONE', page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executePaidTaxesTop };
