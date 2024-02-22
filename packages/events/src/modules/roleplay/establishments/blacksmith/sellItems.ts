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

  const userSelected: Array<InventoryItem & { item: DropItem }> = sentItems.map((item) => ({
    amount: parseInt(item.value, 10),
    id: Number(item.customId),
    item: getItem<DropItem>(item.customId),
  }));

  if (!inventoryUtils.userHasAllItems(character.inventory, userSelected))
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você não possui os itens necessários para vender',
    });

  if (userSelected.some((a) => a.item.sellMinAmount && a.amount % a.item.sellMinAmount !== 0))
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você tentou vender uma quantidade de itens inválida',
    });

  if (await battleRepository.isUserInBattle(ctx.user.id))
    return ctx.respondInteraction({
      flags: MessageFlags.EPHEMERAL,
      content: 'Você não pode acessar o ferreiro enquanto está em uma batalha',
    });

  const totalMoney = userSelected.reduce(
    (p, c) =>
      (c.item.sellMinAmount ? c.amount / c.item.sellMinAmount : c.amount) * c.item.sellValue + p,
    0,
  );

  const newInventory = inventoryUtils.removeItems(character.inventory, userSelected);

  await roleplayRepository.updateCharacter(ctx.user.id, {
    inventory: newInventory,
    money: character.money + totalMoney,
  });

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: `Você vendeu seus itens por ${totalMoney} dinheiros`,
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
      id: Number(ctx.interaction.data.values[i]),
      amount: item.sellMinAmount ?? 1,
    })),
  );

  if (!userHaveItems)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: 'Tu não tem os itens o suficiente para vender',
    });

  const modalInputs = selectedItems.map((item, i) =>
    createActionRow([
      createTextInput({
        customId: ctx.interaction.data.values[i],
        label: `${item.$devName}`,
        style: TextStyles.Short,
        minLength: 1,
        maxLength: 2,
        placeholder: `A venda deste item deve ser múltipla de ${item.sellMinAmount ?? 1}`,
      }),
    ]),
  );

  ctx.respondWithModal({
    title: 'Vender itens',
    customId: createCustomId(0, ctx.user.id, ctx.commandId, 'SELL_MODAL'),
    components: modalInputs,
  });
};

export { displaySellItemsModal, executeSellItem };
