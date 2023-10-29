import { User } from 'discordeno/transformers';
import { getTopCommandsByUser } from '../../utils/apiRequests/statistics';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
import { InteractionContext } from '../../types/menhera';
import { calculateSkipCount, createPaginationButtons } from '.';
import { getDisplayName } from '../../utils/discord/userUtils';

const executeUsedCommandsFromUserTop = async (
  ctx: InteractionContext,
  user: User,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);
  const res = await getTopCommandsByUser(user.id, skip);

  if (!res || res.length === 0)
    return ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.user', { user: getDisplayName(user), page }),
    color: hexStringToNumber(embedColor),
    fields: [],
  });

  for (let i = 0; i < res.length; i++) {
    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(res[i].name)}`,
      value: ctx.locale('commands:top.use', { times: res[i].uses }),
      inline: false,
    });
  }

  const pagination = createPaginationButtons(ctx, 'user', `${user.id}`, embedColor, page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUsedCommandsFromUserTop };
