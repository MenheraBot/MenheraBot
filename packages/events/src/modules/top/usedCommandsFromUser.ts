import { User } from 'discordeno/transformers';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
import { InteractionContext } from '../../types/menhera';
import { calculateSkipCount, createPaginationButtons } from '.';
import { getDisplayName } from '../../utils/discord/userUtils';
import { getTopCommandsByUses } from '../../utils/apiRequests/statistics';
import userRepository from '../../database/repositories/userRepository';
import titlesRepository from '../../database/repositories/titlesRepository';

const executeUsedCommandsFromUserTop = async (
  ctx: InteractionContext,
  user: User,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);
  const res = await getTopCommandsByUses(skip, `${user.id}`);

  if (!res || res.length === 0)
    return ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

  const userData = await userRepository.ensureFindUser(user.id);

  const rawTitle = await titlesRepository.getTitleInfo(userData.currentTitle);

  const translatedTitle =
    ctx.guildLocale === 'en-US' ? rawTitle?.textLocalizations?.['en-US'] : rawTitle?.text;

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.user', {
      user: getDisplayName(user),
      page: page > 1 ? page : 1,
    }),
    color: hexStringToNumber(embedColor),
    footer: { text: translatedTitle ?? '' },
    fields: [],
  });

  for (let i = 0; i < res.length; i++)
    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(res[i].name)}`,
      value: ctx.locale('commands:top.use', { times: res[i].uses }),
      inline: false,
    });

  const pagination = createPaginationButtons(ctx, 'user', `${user.id}`, embedColor, page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUsedCommandsFromUserTop };
