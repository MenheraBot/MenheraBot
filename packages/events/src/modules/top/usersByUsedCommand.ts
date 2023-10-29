import { calculateSkipCount, createPaginationButtons, usersToIgnoreInTop } from '.';
import cacheRepository from '../../database/repositories/cacheRepository';
import { InteractionContext } from '../../types/menhera';
import { getTopUsersByUses } from '../../utils/apiRequests/statistics';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';

const executeUsersByUsedCommandTop = async (
  ctx: InteractionContext,
  commandId: number,
  page: number,
  embedColor: string,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const usersToIgnore = await usersToIgnoreInTop();
  const res = await getTopUsersByUses(skip, usersToIgnore, commandId);

  if (!res || res.length === 0)
    return ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.users-by-commands', {
      page: page > 1 ? page : 1,
      command: res[0].commandName,
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
      value: ctx.locale('commands:top.use', { times: res[i].uses }),
      inline: false,
    });
  }

  const pagination = createPaginationButtons(ctx, 'command', `${commandId}`, embedColor, page);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (embed.fields!.length < 10) pagination.components[1]!.disabled = true;

  ctx.makeMessage({ embeds: [embed], components: [pagination] });
};

export { executeUsersByUsedCommandTop };
