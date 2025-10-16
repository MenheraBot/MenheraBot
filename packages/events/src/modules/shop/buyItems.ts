import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import userRepository from '../../database/repositories/userRepository.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import shopRepository from '../../database/repositories/shopRepository.js';
import { HuntMagicItems } from '../hunt/magicItems.js';
import { HuntProbablyBoostItem } from '../hunt/types.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import { COLORS, EMOJIS } from '../../structures/constants.js';
import {
  createActionRow,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils.js';
import { createEmbed } from '../../utils/discord/embedUtils.js';
import { getUserAvatar } from '../../utils/discord/userUtils.js';

const executeSelectItem = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const selectedItem = Number(ctx.interaction.data.values[0]);

  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  if ((HuntMagicItems[selectedItem] as HuntProbablyBoostItem).cost > authorData.estrelinhas) {
    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_item.poor'),
    });

    return;
  }

  await shopRepository.executeBuyItem(
    ctx.user.id,
    selectedItem,
    (HuntMagicItems[selectedItem] as HuntProbablyBoostItem).cost,
  );

  const commandInfo = await commandRepository.getCommandInfo('itens');

  ctx.makeMessage({
    embeds: [],
    components: [],
    content: ctx.prettyResponse('success', 'commands:loja.buy_item.success', {
      item: ctx.locale(`data:magic-items.${selectedItem as 1}.name`),
      command: `</itens:${commandInfo?.discordId}>`,
    }),
  });
};

const buyItems = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  const embed = createEmbed({
    title: ctx.locale('commands:loja.buy_item.title'),
    color: COLORS.Pinkie,
    thumbnail: { url: getUserAvatar(ctx.author, { enableGif: true }) },
    description: ctx.locale('commands:loja.buy_item.description'),
  });

  const selectMenu = createSelectMenu({
    customId: createCustomId(1, ctx.author.id, ctx.originalInteractionId, 'BUY'),
    minValues: 1,
    maxValues: 1,
    options: [],
  });

  for (let i = 1; i <= 6; i++) {
    if (
      !ctx.authorData.inventory.some((a) => a.id === i) &&
      !ctx.authorData.inUseItems.some((a) => a.id === i)
    )
      selectMenu.options.push({
        label: ctx.locale(`data:magic-items.${i as 1}.name`),
        value: `${i}`,
        description: `${(HuntMagicItems[i] as HuntProbablyBoostItem).cost} ${EMOJIS.estrelinhas}`,
      });
  }

  if (selectMenu.options.length === 0) {
    ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:loja.buy_item.hasAll') });
    return finishCommand();
  }

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([selectMenu])] });
  finishCommand();
};

export { buyItems, executeSelectItem };
