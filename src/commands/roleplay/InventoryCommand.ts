import { ConsumableItem, EquipmentItem, ItemsFile } from '@roleplay/Types';
import { makeCloseCommandButton, removeFromInventory } from '@roleplay/utils/AdventureUtils';
import { getUserMaxLife, getUserMaxMana } from '@roleplay/utils/Calculations';
import { getEquipmentById, getItemById } from '@roleplay/utils/DataUtils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IReturnData } from '@custom_types/Menhera';
import Util, {
  actionRow,
  disableComponents,
  makeCustomId,
  resolveCustomId,
  resolveSeparatedStrings,
} from '@utils/Util';
import {
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';
import { isItemEquipment } from '@roleplay/utils/ItemsUtil';

export default class InventoryCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'inventário',
      nameLocalizations: { 'en-US': 'inventory' },
      description: '【ＲＰＧ】📦 | Abra o inventário de alguém',
      descriptionLocalizations: { 'en-US': "【ＲＰＧ】📦 | Open someone's inventory" },
      category: 'roleplay',
      options: [
        {
          name: 'user',
          description: 'O usuário que queres ver o inventário',
          descriptionLocalizations: { 'en-US': 'O usuário que queres ver o inventário' },
          type: 'USER',
          required: false,
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const mentioned = ctx.options.getUser('user') ?? ctx.author;

    const user = await ctx.client.repositories.roleplayRepository.findUser(mentioned.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const embed = new MessageEmbed()
      .setThumbnail(mentioned.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:inventario.title', { user: mentioned.username }))
      .setColor(ctx.data.user.selectedColor);

    const resolvedItems: Array<
      IReturnData<ItemsFile | EquipmentItem> & { level: number; amount: number }
    > = [];

    const text = user.inventory.map((a) => {
      resolvedItems.push({
        ...(isItemEquipment(a.id) ? getEquipmentById(a.id) : getItemById(a.id)),
        level: a.level,
        amount: a.amount,
      });
      return `• **${ctx.locale(`items:${a.id as 1}.name`)}** | ${ctx.locale(
        'common:roleplay.level',
      )} - **${a.level}** (${a.amount}) `;
    });

    embed.setDescription(
      text.length > 0 ? text.join('\n') : ctx.locale('commands:inventario.no-items'),
    );

    const [useCustomId, baseId] = makeCustomId('USE');
    const [equipCustomId] = makeCustomId('EQUIP', baseId);

    const usePotion = new MessageButton()
      .setCustomId(useCustomId)
      .setLabel(ctx.locale('commands:inventario.use-potion'))
      .setStyle('PRIMARY')
      .setDisabled(true);

    const equipItem = new MessageButton()
      .setCustomId(equipCustomId)
      .setLabel(ctx.locale('commands:inventario.equip-item'))
      .setStyle('PRIMARY')
      .setDisabled(true);

    if (
      mentioned.id === ctx.author.id &&
      resolvedItems.some((a) => a.data.type === 'potion') &&
      (user.mana < getUserMaxMana(user) || user.life < getUserMaxLife(user)) &&
      !user.cooldowns.some((a) => a.reason === 'church' && a.data !== 'COOLDOWN')
    )
      usePotion.setDisabled(false);

    if (mentioned.id === ctx.author.id && resolvedItems.some((a) => isItemEquipment(a.id)))
      equipItem.setDisabled(false);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([usePotion, equipItem])] });

    if (usePotion.disabled) return;

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
      7000,
    );

    if (!selected) {
      ctx.makeMessage({
        components: [
          actionRow(disableComponents(ctx.locale('common:timesup'), [usePotion, equipItem])),
        ],
      });
      return;
    }

    // TODO: Diferenciar se é uma poção ou um equip

    embed.setDescription('');

    const availablePotions = resolvedItems.filter((a) => a.data.type === 'potion') as Array<
      IReturnData<ConsumableItem> & { level: number; amount: number }
    >;

    const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELECT`);

    const showedItems: { id: number; level: number }[] = [];

    availablePotions.forEach((a) => {
      if (!showedItems.some((b) => a.id === b.id && a.level === b.level))
        showedItems.push({ id: a.id, level: a.level });
      if (selectMenu.options.length < 25) {
        for (let i = 0; i < a.amount; i++) {
          selectMenu.addOptions({
            label: ctx.locale(`items:${a.id as 1}.name`),
            value: `${a.id} | ${a.level} | ${i}`,
          });
        }
      }
    });

    showedItems.forEach((a) => {
      const item = getItemById<ConsumableItem>(a.id);
      embed.addField(
        ctx.locale(`items:${a.id as 1}.name`),
        ctx.locale('commands:inventario.use-description', {
          level: a.level,
          regeneration: item.data.baseBoost + item.data.perLevel * a.level,
        }),
      );
    });

    const [itemsCustomId, newBase] = makeCustomId('USE');

    selectMenu.setMaxValues(selectMenu.options.length).setCustomId(itemsCustomId);

    const exitButton = makeCloseCommandButton(newBase, ctx.i18n);

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([exitButton]), actionRow([selectMenu])],
    });

    const selectedItems =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        newBase,
        7000,
      );

    if (!selectedItems) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    if (resolveCustomId(selectedItems.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    selectedItems.values.forEach((a) => {
      const [itemId, itemLevel] = resolveSeparatedStrings(a);
      const item = getItemById<ConsumableItem>(Number(itemId));

      const toRegenValue = Math.floor(item.data.baseBoost + item.data.perLevel * Number(itemLevel));
      const toRegenType = item.data.boostType;

      user[toRegenType] += toRegenValue;
      removeFromInventory([{ id: Number(itemId), level: Number(itemLevel) }], user.inventory);
    });

    if (user.life > getUserMaxLife(user)) user.life = getUserMaxLife(user);
    if (user.mana > getUserMaxMana(user)) user.mana = getUserMaxMana(user);

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      life: user.life,
      mana: user.mana,
      inventory: user.inventory,
    });

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:inventario.use-success'),
    });
  }
}
