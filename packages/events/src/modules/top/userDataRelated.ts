import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { calculateSkipCount, createPaginationButtons } from '.';
import cacheRepository from '../../database/repositories/cacheRepository';
import userRepository from '../../database/repositories/userRepository';
import { DatabaseUserSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { createActionRow, createButton } from '../../utils/discord/componentUtils';

const executeUserDataRelatedTop = async (
  ctx: InteractionContext,
  label: keyof DatabaseUserSchema,
  emoji: string,
  embedTitle: string,
  actor: string,
  page: number,
  color: number,
): Promise<void> => {
  const skip = calculateSkipCount(page);

  const res = await userRepository.getTopRanking(
    label,
    skip,
    await cacheRepository.getDeletedAccounts(),
  );

  const embed = createEmbed({
    title: `${emoji} | ${embedTitle} ${page > 1 ? page : 1}º`,
    color,
    fields: [],
  });

  const members = await Promise.all(
    res.map((a) => cacheRepository.getDiscordUser(`${a.id}`, page <= 3)),
  );

  for (let i = 0; i < res.length; i++) {
    const member = members[i];
    const memberName = member ? getDisplayName(member) : `ID ${res[i].id}`;

    if (member) {
      if (i === 0) embed.thumbnail = { url: getUserAvatar(member, { enableGif: true }) };
      if (member.username.startsWith('Deleted User'))
        cacheRepository.addDeletedAccount([`${res[i].id}`]);
    }

    embed.fields?.push({
      name: `**${skip + 1 + i} -** ${memberName}`,
      value: `${actor}: **${res[i].value}**`,
      inline: false,
    });
  }

  const [next, back] = createPaginationButtons(ctx, 'economy', label, 'NONE', page).components;

  const toSendComponents = [next];

  if (['demons', 'giants', 'angels', 'archangels', 'demigods', 'gods'].includes(label))
    toSendComponents.push(
      createButton({
        style: ButtonStyles.Link,
        label: ctx.locale('commands:top.estatisticas.cacar.weekly'),
        url: 'https://menherabot.xyz/?utm_source=discord&utm_medium=button_component#ranking',
      }),
    );

  toSendComponents.push(back as ButtonComponent);

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow(toSendComponents as [ButtonComponent])],
  });
};

export { executeUserDataRelatedTop };
