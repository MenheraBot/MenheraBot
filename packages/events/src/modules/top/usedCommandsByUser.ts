import { User } from 'discordeno/transformers';
import { getUserProfileInfo } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';
import { InteractionContext } from '../../types/menhera';

const executeUsedCommandsByUserTop = async (
  ctx: InteractionContext,
  user: User,
  page: number,
): Promise<void> => {
  if (!user) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:top.not-user') });

    return;
  }

  const res = await getUserProfileInfo(user.id);

  if (!res || res.cmds.count === 0) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:top.not-user') });

    return;
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.user', { user: user.username }),
    color: 0xf47fff,
    fields: [],
  });

  for (let i = 0; i < res.array.length; i++) {
    if (i > 10) break;

    embed.fields?.push({
      name: `**${i + 1} -** ${capitalize(res.array[i].name)}`,
      value: `${ctx.locale('commands:top.use')} **${res.array[i].count}** ${ctx.locale(
        'commands:top.times',
      )}`,
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });
};

export { executeUsedCommandsByUserTop };
