import cacheRepository from '../../database/repositories/cacheRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { getUsersThatMostUsedCommands } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';

const executeUserCommandsTop = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const res = await getUsersThatMostUsedCommands();

  if (!res) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:http-error') });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('smile', 'commands:top.users'),
    color: 0xf47fff,
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
      name: `**${i + 1} -** ${member ? getDisplayName(member) : `ID ${res[i].id}`}`,
      value: `${ctx.locale('commands:top.use')} **${res[i].uses}** ${ctx.locale(
        'commands:top.times',
      )}`,
      inline: false,
    });
  }

  ctx.makeMessage({ embeds: [embed] });

  finishCommand();
};

export { executeUserCommandsTop };
