import { ButtonStyles } from 'discordeno/types';
import { calculateSkipCount } from '.';
import cacheRepository from '../../database/repositories/cacheRepository';
import userRepository from '../../database/repositories/userRepository';
import { DatabaseUserSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';

const executeUserDataRelatedTop = async (
  ctx: InteractionContext,
  label: keyof DatabaseUserSchema,
  emoji: string,
  embedTitle: string,
  actor: string,
  page: number,
  color: number,
  finishCommand: () => void,
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

  const backButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
      'economy',
      label,
      page === 0 ? 1 : page - 1,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:back'),
    disabled: page < 2,
  });

  const nextButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.commandId,
      'economy',
      label,
      page === 0 ? 2 : page + 1,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:next'),
    disabled: page === 100,
  });

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([backButton, nextButton])] });

  finishCommand();
};

export { executeUserDataRelatedTop };
