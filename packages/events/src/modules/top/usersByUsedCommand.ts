import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { getUsersByUsedCommand } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { capitalize } from '../../utils/miscUtils';

const executeUsersByUsedCommandTop = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const res = await getUsersByUsedCommand(0);

  if (!res) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:api-error') });

    return;
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('robot', 'commands:top.commands'),
    color: 0xf47fff,
    fields: [],
  });

  for (let i = 0; i < res.length; i++)
    embed.fields?.push({
      name: `**${i + 1} -** ${capitalize(res[i].id)}`,
      value: `${ctx.locale('commands:top.used')} **${res[i].uses}** ${ctx.locale(
        'commands:top.times',
      )}`,
      inline: false,
    });

  ctx.makeMessage({ embeds: [embed] });
};

export { executeUsersByUsedCommandTop };
