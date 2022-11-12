import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import { SelectMenuInteraction } from '../../types/interaction';
import shopRepository from '../../database/repositories/shopRepository';
import { HuntMagicItems } from '../hunt/magicItems';
import { HuntProbablyBoostItem } from '../hunt/types';
import InteractionContext from '../../structures/command/InteractionContext';
import { COLORS, EMOJIS } from '../../structures/constants';
import {
  createActionRow,
  createSelectMenu,
  disableComponents,
  generateCustomId,
} from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getUserAvatar } from '../../utils/discord/userUtils';

const buyItems = async (ctx: InteractionContext, finishCommand: () => void): Promise<void> => {
  const embed = createEmbed({
    title: ctx.locale('commands:loja.buy_item.title'),
    color: COLORS.Pinkie,
    thumbnail: { url: getUserAvatar(ctx.author, { enableGif: true }) },
    description: ctx.locale('commands:loja.buy_item.description'),
  });

  const selectMenu = createSelectMenu({
    customId: generateCustomId('BUY', ctx.interaction.id),
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

  const choice = await collectResponseComponentInteraction<SelectMenuInteraction>(
    ctx.channelId,
    ctx.author.id,
    `${ctx.interaction.id}`,
    10_000,
  );

  if (!choice) {
    ctx.makeMessage({
      components: [createActionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
    });

    return finishCommand();
  }

  const selectedItem = Number(choice.data.values[0]);

  if ((HuntMagicItems[selectedItem] as HuntProbablyBoostItem).cost > ctx.authorData.estrelinhas) {
    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:loja.buy_item.poor'),
    });

    return finishCommand();
  }

  await shopRepository.executeBuyItem(
    ctx.author.id,
    selectedItem,
    (HuntMagicItems[selectedItem] as HuntProbablyBoostItem).cost,
  );

  ctx.makeMessage({
    embeds: [],
    components: [],
    content: ctx.prettyResponse('success', 'commands:loja.buy_item.success', {
      item: ctx.locale(`data:magic-items.${selectedItem as 1}.name`),
    }),
  });

  finishCommand();
};

export { buyItems };
