import { calculateSkipCount, createPaginationButtons } from '.';
import { InteractionContext } from '../../types/menhera';
import { getMostUsedCommands } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';

const executeUsedCommandsTop = async (ctx: InteractionContext, page: number): Promise<void> => {
  const skip = calculateSkipCount(page);
  const res = await getMostUsedCommands(skip);

  if (!res || res.length === 0)
    return ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

  const embed = createEmbed({
    title: ctx.prettyResponse('robot', 'commands:top.commands', { page: page > 1 ? page : 1 }),
    color: 0xf47fff,
    fields: [],
  });

  for (let i = 0; i < res.length; i++)
    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(res[i].name)}`,
      value: ctx.locale('commands:top.used', { times: res[i].usages }),
      inline: false,
    });

  const pagination = createPaginationButtons(ctx, 'commands', '', '', page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUsedCommandsTop };
