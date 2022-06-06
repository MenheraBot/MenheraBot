import { ConsumableItem } from '@roleplay/Types';
import {
  makeCloseCommandButton,
  removeFromInventory,
  addToInventory,
} from '@roleplay/utils/AdventureUtils';
import { getUserMaxLife, getUserMaxMana } from '@roleplay/utils/Calculations';
import { getEquipmentById, getItemById } from '@roleplay/utils/DataUtils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import Util, {
  actionRow,
  debugError,
  disableComponents,
  makeCustomId,
  resolveCustomId,
  resolveSeparatedStrings,
} from '@utils/Util';
import {
  MessageEmbed,
  MessageSelectMenu,
  Modal,
  SelectMenuInteraction,
  TextInputComponent,
} from 'discord.js-light';
import { isItemEquipment } from '@roleplay/utils/ItemsUtil';

export default class InventoryCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'inventário',
      nameLocalizations: { 'en-US': 'inventory' },
      description: '【ＲＰＧ】📦 | Tome ações relacionadas ao inventário',
      descriptionLocalizations: { 'en-US': '【ＲＰＧ】📦 | Make actions based on inventory' },
      category: 'roleplay',
      options: [
        {
          name: 'poções',
          description: '【ＲＰＧ】🧪 | Use suas poções',
          type: 'SUB_COMMAND',
          nameLocalizations: { 'en-US': 'potions' },
          descriptionLocalizations: { 'en-US': '【ＲＰＧ】🧪 | Use your potions' },
        },
        {
          name: 'equipar',
          description: '【ＲＰＧ】🎒 | Equipe seus equipamentos',
          type: 'SUB_COMMAND',
          nameLocalizations: { 'en-US': 'equip' },
          descriptionLocalizations: { 'en-US': '【ＲＰＧ】🎒 | Equip your equipments' },
        },
        {
          name: 'ver',
          description: '【ＲＰＧ】📦 | Veja o inventário de alguém',
          type: 'SUB_COMMAND',
          nameLocalizations: { 'en-US': 'see' },
          descriptionLocalizations: { 'en-US': "【ＲＰＧ】📦 | Open someone's inventory" },
          options: [
            {
              name: 'user',
              description: 'O usuário que queres ver o inventário',
              descriptionLocalizations: { 'en-US': 'O usuário que queres ver o inventário' },
              type: 'USER',
              required: false,
            },
          ],
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand();

    switch (command) {
      case 'ver':
        return InventoryCommand.seeInventory(ctx);
      case 'poções':
        return InventoryCommand.usePotions(ctx);
      case 'equipamentos':
        return InventoryCommand.useEquipments(ctx);
    }
  }

  static async seeInventory(ctx: InteractionCommandContext): Promise<void> {
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

    const text = user.inventory.map(
      (a) =>
        `• **${ctx.locale(`items:${a.id as 1}.name`)}** | ${ctx.locale(
          'common:roleplay.level',
        )} - **${a.level}** (${a.amount}) `,
    );

    embed.setDescription(
      text.length > 0 ? text.join('\n') : ctx.locale('commands:inventario.no-items'),
    );

    ctx.makeMessage({ embeds: [embed] });
  }

  static async usePotions(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const availablePotions = user.inventory.filter((a) => {
      const item = getItemById(a.id);
      return item && item.data.type === 'potion';
    });

    if (availablePotions.length === 0) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:inventario.no-potions') });
      return;
    }

    const embed = new MessageEmbed()
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:inventario.title', { user: ctx.author.username }))
      .setColor(ctx.data.user.selectedColor);

    const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELECT`);

    availablePotions.forEach((a) => {
      const item = getItemById<ConsumableItem>(a.id);
      embed.addField(
        ctx.locale(`items:${a.id as 1}.name`),
        ctx.locale('commands:inventario.use-potion-description', {
          level: a.level,
          regeneration: item.data.baseBoost + item.data.perLevel * a.level,
          amount: a.amount,
        }),
      );

      if (selectMenu.options.length < 25)
        selectMenu.addOptions({
          label: ctx.locale(`items:${a.id as 1}.name`),
          value: `${a.id} | ${a.level} | ${a.amount}`,
        });
    });

    const [itemsCustomId, newBase] = makeCustomId('USE');

    selectMenu
      .setMaxValues(selectMenu.options.length > 5 ? 5 : selectMenu.options.length)
      .setCustomId(itemsCustomId);

    const exitButton = makeCloseCommandButton(newBase, ctx.i18n);

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([selectMenu]), actionRow([exitButton])],
    });

    const potionsToUse =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        newBase,
        15_000,
        false,
      );

    if (!potionsToUse) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    if (resolveCustomId(potionsToUse.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const [modalId, modalBaseId] = makeCustomId('MODAL');

    const modal = new Modal()
      .setCustomId(modalId)
      .setTitle(ctx.locale('commands:inventario.use-potion-modal-title'));

    potionsToUse.values.forEach((a) => {
      const [potionId, , maxItems] = resolveSeparatedStrings(a);
      const input = new TextInputComponent()
        .setCustomId(a)
        .setMinLength(1)
        .setMaxLength(2)
        .setPlaceholder('1')
        .setValue('1')
        .setStyle('SHORT')
        .setRequired(true)
        .setLabel(
          ctx.locale('commands:inventario.use-potion-modal-lable', {
            name: ctx.locale(`items:${potionId as '1'}.name`).substring(0, 39),
            max: maxItems,
          }),
        );

      modal.addComponents({ type: 1, components: [input] });
    });

    potionsToUse.showModal(modal).catch(debugError);

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('time', 'common:waiting-form'),
    });

    const modalResponse = await potionsToUse
      .awaitModalSubmit({
        time: 25_000,
        filter: (int) => int.customId.startsWith(`${modalBaseId}`),
      })
      .catch(() => null);

    if (!modalResponse) {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'common:form-timesup'),
      });
      return;
    }

    modalResponse.deferUpdate();

    let didError = false;

    for (let i = 0; i < modalResponse.components.length; i++) {
      const [itemId, itemLevel, maxAmount] = resolveSeparatedStrings(
        modalResponse.components[i].components[0].customId,
      );
      const selectedAmount = parseInt(modalResponse.components[i].components[0].value);

      if (
        Number.isNaN(selectedAmount) ||
        selectedAmount <= 0 ||
        selectedAmount > Number(maxAmount)
      ) {
        didError = true;
        break;
      }

      const item = getItemById<ConsumableItem>(Number(itemId));

      for (let j = 0; j < Number(selectedAmount); i++) {
        const toRegenValue = Math.floor(
          item.data.baseBoost + item.data.perLevel * Number(itemLevel),
        );
        const toRegenType = item.data.boostType;

        user[toRegenType] += toRegenValue;
        removeFromInventory([{ id: Number(itemId), level: Number(itemLevel) }], user.inventory);
      }
    }

    if (didError) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:inventario.use-potion-invalid-selection'),
      });
      return;
    }

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
      content: ctx.prettyResponse('success', 'commands:inventario.use-potion-success'),
    });
  }

  static async useEquipments(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const availableEquipments = user.inventory.filter((a) => isItemEquipment(a.id));

    if (availableEquipments.length === 0) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:inventario.no-equipments'),
      });
      return;
    }

    const embed = new MessageEmbed()
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:inventario.title', { user: ctx.author.username }))
      .setColor(ctx.data.user.selectedColor);

    const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELECT`);

    availableEquipments.forEach((a) => {
      const item = getEquipmentById(a.id);

      const cannotEquip =
        item.data.type === 'backpack' &&
        item.data.levels[a.level].value < user.inventory.reduce((p, c) => p + c.amount, 0);

      embed.addField(
        ctx.locale(`items:${a.id as 1}.name`),
        ctx.locale('commands:inventario.use-equipment-description', {
          level: a.level,
          field: ctx.locale(`commands:inventario.fields.${item.data.type}`),
          value: item.data.levels[a.level].value,
          backpackFull: cannotEquip ? ctx.locale('commands:inventario.backpack-full') : '',
        }),
      );

      if (selectMenu.options.length < 25 && !cannotEquip) {
        selectMenu.addOptions({
          label: ctx.locale(`items:${a.id as 1}.name`),
          value: `${a.id} | ${a.level}`,
        });
      }
    });

    const [itemsCustomId, newBase] = makeCustomId('EQUIP');

    selectMenu.setMaxValues(1).setCustomId(itemsCustomId);

    const exitButton = makeCloseCommandButton(newBase, ctx.i18n);

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([selectMenu]), actionRow([exitButton])],
    });

    const selectedEquipment =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        newBase,
        12_000,
      );

    if (!selectedEquipment) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    if (resolveCustomId(selectedEquipment.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const [itemIdToEquip, itemLevelToEquip] = resolveSeparatedStrings(selectedEquipment.values[0]);
    const item = getEquipmentById(Number(itemIdToEquip));

    const changedItem = user[item.data.type];
    const toAddItem = { id: Number(itemIdToEquip), level: Number(itemLevelToEquip) };

    removeFromInventory([toAddItem], user.inventory);

    addToInventory([{ id: changedItem.id, level: changedItem.level }], user.inventory);

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      [item.data.type]: toAddItem,
      inventory: user.inventory,
    });

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:inventario.equip-success', {
        name: ctx.locale(`items:${itemIdToEquip as '1'}.name`),
      }),
    });
  }
}
