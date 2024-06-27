import { calculateSkipCount, createPaginationButtons } from '.';
import { InteractionContext } from '../../types/menhera';
import { getTopCommandsByUses } from '../../utils/apiRequests/statistics';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';

const executeUsedCommandsTop = async (
  ctx: InteractionContext,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);
  const res = await getTopCommandsByUses(skip);

  if (!res || res.length === 0)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'common:api-error'),
      components: [],
      embeds: [],
    });

  const embed = createEmbed({
    title: ctx.prettyResponse('robot', 'commands:top.commands', { page: page > 1 ? page : 1 }),
    color: hexStringToNumber(embedColor),
    fields: [],
  });

  for (let i = 0; i < res.length; i++)
    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(res[i].name)}`,
      value: ctx.locale('commands:top.used', { times: res[i].uses }),
      inline: false,
    });

  const pagination = createPaginationButtons(ctx, 'commands', embedColor, 'NONE', page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUsedCommandsTop };
