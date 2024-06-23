import { TextStyles } from 'discordeno/types';
import roleplayRepository from '../../../../database/repositories/roleplayRepository';
import ComponentInteractionContext from '../../../../structures/command/ComponentInteractionContext';
import { ModalInteraction, SelectMenuInteraction } from '../../../../types/interaction';
import {
  createActionRow,
  createCustomId,
  createTextInput,
} from '../../../../utils/discord/componentUtils';
import { DropItem, getItem } from '../../data/items';
import inventoryUtils from '../../inventoryUtils';
import { extractFields } from '../../../../utils/discord/modalUtils';
import { InventoryItem } from '../../types';
import { MessageFlags } from '../../../../utils/discord/messageUtils';
import battleRepository from '../../../../database/repositories/battleRepository';

const executeSellItem = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
): Promise<void> => {
  const sentItems = extractFields(ctx.interaction);

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  const userSelected: Array<InventoryItem & { item: DropItem }> = sentItems.map((item) => {
    const itemData = getItem<DropItem>(item.customId);
    let selectedAmount = parseInt(item.value, 10);

    if (itemData.sellMinAmount && selectedAmount % itemData.sellMinAmount !== 0)
      selectedAmount -= selectedAmount % itemData.sellMinAmount;

    return {
      amount: selectedAmount,
      id: Number(item.customId) as 1,
      item: itemData,
    };
  });

  if (!inventoryUtils.userHasAllItems(character.inventory, userSelected))
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:acessar.blacksmith.sell.not-enough-items'),
    });

  if (await battleRepository.isUserInBattle(ctx.user.id))
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:acessar.blacksmith.in-battle'),
    });

  const firstWrongItem = userSelected.find(
    (a) => a.amount < 1 || (a.item.sellMinAmount && a.amount % a.item.sellMinAmount !== 0),
  );

  if (firstWrongItem)
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: ctx.prettyResponse('error', 'commands:acessar.blacksmith.sell.invalid-amount', {
        name: ctx.locale(`items:${firstWrongItem.id}.name`),
        value: firstWrongItem.item.sellMinAmount ?? 1,
      }),
    });

  const [totalMoney, totalItems] = userSelected.reduce(
    (p, c) => [
      (c.item.sellMinAmount ? c.amount / c.item.sellMinAmount : c.amount) * c.item.sellValue + p[0],
      p[1] + c.amount,
    ],
    [0, 0],
  );

  const newInventory = inventoryUtils.removeItems(character.inventory, userSelected);

  await roleplayRepository.updateCharacter(ctx.user.id, {
    inventory: newInventory,
    money: character.money + totalMoney,
  });

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:acessar.blacksmith.sell.sold', {
      amount: totalMoney,
      count: totalItems,
      emoji: ctx.safeEmoji('dragonnys'),
    }),
  });
};

const displaySellItemsModal = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const selectedItems = ctx.interaction.data.values.map((i) => getItem<DropItem>(i));

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  const userHaveItems = inventoryUtils.userHasAllItems(
    character.inventory,
    selectedItems.map((item, i) => ({
      id: Number(ctx.interaction.data.values[i]) as 1,
      amount: item.sellMinAmount ?? 1,
    })),
  );

  if (!userHaveItems)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:acessar.blacksmith.sell.no-items'),
    });

  const modalInputs = selectedItems.map((item, i) =>
    createActionRow([
      createTextInput({
        customId: ctx.interaction.data.values[i],
        label: ctx.locale(`items:${ctx.interaction.data.values[i] as '1'}.name`),
        style: TextStyles.Short,
        minLength: 1,
        maxLength: 2,
        placeholder: ctx.locale('commands:acessar.blacksmith.sell.need-math', {
          amount: item.sellMinAmount ?? 1,
        }),
      }),
    ]),
  );

  ctx.respondWithModal({
    title: ctx.locale('commands:acessar.blacksmith.sell.title'),
    customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'SELL_MODAL'),
    components: modalInputs,
  });
};

export { displaySellItemsModal, executeSellItem };
