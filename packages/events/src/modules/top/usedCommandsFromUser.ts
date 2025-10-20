import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { capitalize } from '../../utils/miscUtils.js';
import { InteractionContext } from '../../types/menhera.js';
import { calculateSkipCount, createPaginationButtons } from './index.js';
import { getDisplayName } from '../../utils/discord/userUtils.js';
import { getTopCommandsByUses, getUserProfileInfo } from '../../utils/apiRequests/statistics.js';
import userRepository from '../../database/repositories/userRepository.js';
import titlesRepository from '../../database/repositories/titlesRepository.js';
import { User } from '../../types/discordeno.js';

const executeUsedCommandsFromUserTop = async (
  ctx: InteractionContext,
  user: User,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);
  const res = await getTopCommandsByUses(skip, `${user.id}`);

  if (!res || res.length === 0)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'common:api-error'),
      components: [],
      embeds: [],
    });

  const totalUsedCommands = await getUserProfileInfo(`${user.id}`);

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
    description: totalUsedCommands
      ? ctx.locale('commands:top.total-used-commands', {
          commands: totalUsedCommands.totalUses,
          user: getDisplayName(user),
        })
      : undefined,
    footer: translatedTitle ? { text: translatedTitle } : undefined,
    fields: [],
  });

  for (let i = 0; i < res.length; i++)
    embed.fields?.push({
      name: `**${skip + i + 1} -** ${capitalize(res[i].name)}`,
      value: ctx.locale('commands:top.use', { times: res[i].uses }),
      inline: false,
    });

  const pagination = createPaginationButtons(ctx, 'user', `${user.id}`, embedColor, page);

  if (embed.fields!.length < 10) {
    if ('disabled' in pagination.components[1]) pagination.components[1].disabled = true;
  }

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUsedCommandsFromUserTop };
