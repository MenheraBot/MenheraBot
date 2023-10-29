import { calculateSkipCount, createPaginationButtons } from '.';
import cacheRepository from '../../database/repositories/cacheRepository';
import { InteractionContext } from '../../types/menhera';
import { getUsersThatMostUsedCommands } from '../../utils/apiRequests/statistics';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';

const executeUserCommandsTop = async (
  ctx: InteractionContext,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);
  const res = await getUsersThatMostUsedCommands(skip);

  if (!res) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

    return;
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.users', { page: page > 1 ? page : 1 }),
    color: hexStringToNumber(embedColor),
    fields: [],
  });

  const members = await Promise.all(res.map((a) => cacheRepository.getDiscordUser(`${a.id}`)));

  for (let i = 0; i < res.length; i++) {
    const member = members[i];

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([res[i].id]);
    }

    embed.fields?.push({
      name: `**${skip + i + 1} -** ${member ? getDisplayName(member) : `ID ${res[i].id}`}`,
      value: ctx.locale('commands:top.used-commands', { times: res[i].uses }),
      inline: false,
    });
  }

  const pagination = createPaginationButtons(ctx, 'users', embedColor, 'NONE', page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUserCommandsTop };
