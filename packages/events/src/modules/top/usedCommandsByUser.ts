import { User } from 'discordeno/transformers';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { getUserProfileInfo } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';

const executeUsedCommandsByUserTop = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const user = ctx.getOption<User>('user', 'users') ?? ctx.author;

  if (!user) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:top.not-user') });

    return finishCommand();
  }

  const res = await getUserProfileInfo(user.id);

  if (!res || res.cmds.count === 0) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:top.not-user') });

    return finishCommand();
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
  finishCommand();
};

export { executeUsedCommandsByUserTop };
