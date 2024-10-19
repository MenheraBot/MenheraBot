import { ActionRow, ButtonStyles } from 'discordeno/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import userRepository from '../../database/repositories/userRepository';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import fairRepository from '../../database/repositories/fairRepository';
import { Plants } from './constants';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { InteractionContext } from '../../types/menhera';
import { DatabaseUserSchema } from '../../types/database';

const handleDissmissShop = async (ctx: ComponentInteractionContext): Promise<void> => {
  const products = await fairRepository.getUserProducts(ctx.user.id);

  const [index] = ctx.sentData;

  const announcement = products[Number(index)];

  if (typeof announcement === 'undefined')
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:fazendinha.admin.feirinha.dont-exists'),
      components: [],
      embeds: [],
    });

  await fairRepository.deleteAnnouncement(announcement._id);

  return executeAdministrateFair(ctx);
};

const executeAdministrateFair = async (
  ctx: InteractionContext,
  authorData?: DatabaseUserSchema,
): Promise<void> => {
  const fromUser = await fairRepository.getUserProducts(ctx.user.id);

  const userData = authorData ?? (await userRepository.ensureFindUser(ctx.user.id));

  const embed = createEmbed({
    author: {
      name: getDisplayName(ctx.user),
      iconUrl: getUserAvatar(ctx.user, { enableGif: true }),
    },
    color: hexStringToNumber(userData.selectedColor),
    fields: [],
  });

  if (fromUser.length === 0) {
    embed.description = ctx.locale('commands:fazendinha.admin.feirinha.no-items-in-user-fair');
    return ctx.makeMessage({ embeds: [embed], components: [] });
  }

  const toSendComponents: ActionRow[] = [];

  fromUser.forEach((item, i) => {
    embed.fields?.push({
      name: `${item[`name_${ctx.guildLocale}`]} (${i + 1})`,
      inline: true,
      value: `${item.price} :star:\n${Plants[item.plantType].emoji} ${item.weight} kg`,
    });

    const index = Math.floor(i / 3);

    const button = createButton({
      label: ctx.locale('commands:fazendinha.admin.feirinha.remove-announcement', {
        index: i + 1,
      }),
      style: ButtonStyles.Danger,
      customId: createCustomId(6, ctx.user.id, ctx.originalInteractionId, i),
    });

    if (typeof toSendComponents[index] === 'undefined')
      toSendComponents.push(createActionRow([button]));
    else toSendComponents[index].components.push(button);
  });

  ctx.makeMessage({ embeds: [embed], components: toSendComponents });
};

export { executeAdministrateFair, handleDissmissShop };
