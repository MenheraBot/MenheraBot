import {
  BackPackItem,
  ConsumableItem,
  DropItem,
  LeveledItem,
  ProtectionItem,
  RoleplayUserSchema,
  WeaponItem,
} from '@roleplay/Types';
import {
  addToInventory,
  getFreeInventorySpace,
  removeFromInventory,
} from '@roleplay/utils/AdventureUtils';
import { getItemById } from '@roleplay/utils/DataUtils';
import { availableToBuyItems } from '@roleplay/utils/ItemsUtil';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/Constants';
import Util, {
  actionRow,
  disableComponents,
  negate,
  resolveCustomId,
  resolveSeparatedStrings,
} from '@utils/Util';
import {
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

export default class DowntownInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'centro',
      description: '【ＲＰＧ】🏛️ | Centro de Boleham, aqui tu encontra de tudo',
      category: 'roleplay',
      options: [
        {
          name: 'guilda',
          description: '【ＲＰＧ】🏠 | Retire quests e reivindique-as',
          type: 'SUB_COMMAND',
        },
        {
          name: 'ferreiro',
          description: '【ＲＰＧ】⚒️ | Compre e faça itens de batalha',
          type: 'SUB_COMMAND',
        },
        {
          name: 'mercado',
          description: '【ＲＰＧ】🛒 | Compre e venda itens',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'comprar',
              description: '【ＲＰＧ】🛒 | Compre itens para lhe ajudar nas batalhas',
              type: 'SUB_COMMAND',
            },
            {
              name: 'vender',
              description: '【ＲＰＧ】🛒 | Venda espólios de batalha para conseguir Moedas Reais',
              type: 'SUB_COMMAND',
            },
          ],
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const option = ctx.options.getSubcommand();

    if (option === 'vender') return DowntownInteractionCommand.sellItems(ctx, user);

    if (option === 'comprar') return DowntownInteractionCommand.buyItems(ctx, user);

    if (option === 'ferreiro') return DowntownInteractionCommand.blacksmith(ctx, user);

    if (option === 'guilda')
      ctx.makeMessage({ content: ctx.prettyResponse('wink', 'common:soon'), ephemeral: true });
  }

  static async blacksmith(ctx: InteractionCommandContext, user: RoleplayUserSchema): Promise<void> {
    const userBackpack = getItemById<BackPackItem>(user.backpack.id);
    const userWeapon = getItemById<WeaponItem>(user.weapon.id);
    const userProtection = getItemById<ProtectionItem>(user.protection.id);

    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.prettyResponse('blacksmith', 'commands:centro.blacksmith.title'))
      .setDescription(ctx.locale('commands:centro.blacksmith.description'))
      .addFields([
        {
          name: ctx.prettyResponse('chest', 'common:roleplay.backpack'),
          value: ctx.locale('commands:centro.blacksmith.backpack-description', {
            name: ctx.locale(`items:${user.backpack.id as 1}.name`),
            level: user.backpack.level,
            capacity: Math.floor(
              userBackpack.data.capacity + userBackpack.data.perLevel * user.backpack.level,
            ),
          }),
          inline: true,
        },
        {
          name: ctx.prettyResponse('damage', 'common:roleplay.weapon'),
          value: ctx.locale('commands:centro.blacksmith.weapon-description', {
            name: ctx.locale(`items:${user.weapon.id as 1}.name`),
            level: user.weapon.level,
            damage: Math.floor(
              userWeapon.data.damage + userWeapon.data.perLevel * user.weapon.level,
            ),
          }),
          inline: true,
        },
        {
          name: ctx.prettyResponse('armor', 'common:roleplay.protection'),
          value: ctx.locale('commands:centro.blacksmith.protection-description', {
            name: ctx.locale(`items:${user.protection.id as 1}.name`),
            level: user.protection.level,
            armor: Math.floor(
              userProtection.data.armor + userProtection.data.perLevel * user.protection.level,
            ),
          }),
          inline: true,
        },
      ]);
    const backpackButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | BACKPACK`)
      .setLabel(ctx.locale('common:roleplay.backpack'))
      .setStyle('PRIMARY');

    const protectionButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | PROTECTION`)
      .setLabel(ctx.locale('common:roleplay.protection'))
      .setStyle('PRIMARY');

    const weaponButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | WEAPON`)
      .setLabel(ctx.locale('common:roleplay.weapon'))
      .setStyle('PRIMARY');

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([backpackButton, protectionButton, weaponButton])],
    });

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      9000,
    );

    if (!selected) {
      ctx.makeMessage({
        components: [
          actionRow(
            disableComponents(ctx.locale('common:timesup'), [
              backpackButton,
              protectionButton,
              weaponButton,
            ]),
          ),
        ],
      });
      return;
    }

    const evolveButton = new MessageButton()
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('commands:centro.blacksmith.evolve'));

    if (resolveCustomId(selected.customId) === 'PROTECTION') {
      const costToEvolve =
        userProtection.data.toUpgrade.cost +
        userProtection.data.toUpgrade.costPerLevel *
          (user.protection.level === 1 ? 0 : 2 ** (user.protection.level - 1));

      embed.setFields([]).setDescription(
        ctx.locale('commands:centro.blacksmith.evolve-description', {
          cost: costToEvolve,
          name: ctx.locale(`items:${user.protection.id as 1}.name`),
          level: user.protection.level + 1,
          bonus: userProtection.data.toUpgrade.boostPerUpgrade,
          bonusEmoji: emojis.armor,
          coinEmoji: emojis.coin,
        }),
      );

      evolveButton.setCustomId(`${ctx.interaction.id} | ${costToEvolve}`);
      if (costToEvolve > user.money)
        evolveButton.setDisabled(true).setLabel(ctx.locale('commands:centro.blacksmith.poor'));
    }

    if (resolveCustomId(selected.customId) === 'WEAPON') {
      const costToEvolve =
        userWeapon.data.toUpgrade.cost +
        userWeapon.data.toUpgrade.costPerLevel *
          (user.weapon.level === 1 ? 0 : 2 ** (user.weapon.level - 1));

      embed.setFields([]).setDescription(
        ctx.locale('commands:centro.blacksmith.evolve-description', {
          cost: costToEvolve,
          name: ctx.locale(`items:${user.weapon.id as 1}.name`),
          level: user.weapon.level + 1,
          bonus: userWeapon.data.toUpgrade.boostPerUpgrade,
          bonusEmoji: emojis.damage,
          coinEmoji: emojis.coin,
        }),
      );

      evolveButton.setCustomId(`${ctx.interaction.id} | ${costToEvolve}`);
      if (costToEvolve > user.money)
        evolveButton.setDisabled(true).setLabel(ctx.locale('commands:centro.blacksmith.poor'));
    }

    if (resolveCustomId(selected.customId) === 'BACKPACK') {
      const costToEvolve =
        userBackpack.data.toUpgrade.cost +
        userBackpack.data.toUpgrade.costPerLevel *
          (user.backpack.level === 1 ? 0 : 2 ** (user.backpack.level - 1));

      embed.setFields([]).setDescription(
        ctx.locale('commands:centro.blacksmith.evolve-description', {
          cost: costToEvolve,
          name: ctx.locale(`items:${user.backpack.id as 1}.name`),
          level: user.backpack.level + 1,
          bonus: userBackpack.data.toUpgrade.boostPerUpgrade,
          bonusEmoji: emojis.chest,
          coinEmoji: emojis.coin,
        }),
      );

      evolveButton.setCustomId(`${ctx.interaction.id} | ${costToEvolve}`);
      if (costToEvolve > user.money)
        evolveButton.setDisabled(true).setLabel(ctx.locale('commands:centro.blacksmith.poor'));
    }

    ctx.makeMessage({ components: [actionRow([evolveButton])], embeds: [embed] });
    if (evolveButton.disabled) return;

    const wannaEvolve = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7_000,
    );

    if (!wannaEvolve) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [evolveButton]))],
      });
      return;
    }

    const costToEvolve = Number(resolveCustomId(wannaEvolve.customId));

    const field = resolveCustomId(selected.customId).toLowerCase() as 'backpack';

    user[field].level += 1;

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      $inc: { money: negate(costToEvolve) },
      [field]: user[field],
    });

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:centro.blacksmith.success'),
    });
  }

  static async buyItems(ctx: InteractionCommandContext, user: RoleplayUserSchema): Promise<void> {
    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:centro.buy.title'));

    const selector = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | BUY`)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.locale('commands:centro.buy.select'));

    const availableItems = availableToBuyItems(user.level);

    availableItems.forEach((a) => {
      const item = getItemById<ConsumableItem>(a.id);
      selector.addOptions({
        label: ctx.locale(`items:${a.id as 1}.name`),
        value: `${a.id} | ${a.level}`,
      });
      embed.addField(
        ctx.locale(`items:${a.id as 1}.name`),
        ctx.locale('commands:centro.buy.consumable-desc', {
          cost: Math.ceil(item.data.marketValue * a.level),
          coinEmoji: emojis.coin,
          boostValue: Math.floor(item.data.baseBoost + item.data.perLevel * a.level),
          boostEmoji: item.data.boostType === 'life' ? emojis.blood : emojis.mana,
        }),
      );
    });

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selector])] });

    const selectedItem =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        9000,
      );

    if (!selectedItem) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selector]))],
      });
      return;
    }

    selector.setOptions([]).setPlaceholder(ctx.locale('commands:centro.buy.select-amount'));

    for (let i = 1; i <= 25; i++) selector.addOptions({ label: `${i}`, value: `${i}` });

    ctx.makeMessage({ components: [actionRow([selector])] });

    const selectedAmount =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        8000,
      );

    if (!selectedAmount) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selector]))],
      });
      return;
    }

    const toBuyAmount = Number(selectedAmount.values[0]);
    const [toBuyItemId, toBuyItemLevel] = resolveSeparatedStrings(selectedItem.values[0]).map((a) =>
      Number(a),
    );

    const resolvedItem = getItemById<ConsumableItem>(toBuyItemId);
    const totalCost = Math.ceil(resolvedItem.data.marketValue * toBuyItemLevel) * toBuyAmount;

    if (totalCost > user.money) {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'commands:centro.buy.poor', {
          coinEmoji: emojis.coin,
          amount: totalCost,
        }),
      });
      return;
    }

    if (getFreeInventorySpace(user) < toBuyAmount) {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'commands:centro.buy.inventory-full'),
      });
      return;
    }

    const toAddInventory: LeveledItem[] = [];

    for (let i = 0; i < toBuyAmount; i++)
      toAddInventory.push({ id: toBuyItemId, level: toBuyItemLevel });

    addToInventory(toAddInventory, user.inventory);

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      inventory: user.inventory,
      $inc: { money: negate(totalCost) },
    });

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:centro.buy.success', {
        totalCost,
        itemName: ctx.locale(`items:${toBuyItemId as 1}.name`),
        amount: toBuyAmount,
        emojiCoin: emojis.coin,
      }),
    });
  }

  static async sellItems(ctx: InteractionCommandContext, user: RoleplayUserSchema): Promise<void> {
    if (user.inventory.length === 0) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:centro.sell.no-items') });
      return;
    }

    const sellableItems = user.inventory.filter(
      (a) => getItemById(a.id).data.type === 'enemy_drop',
    );

    if (sellableItems.length === 0) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:centro.sell.no-items') });
      return;
    }

    const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELL`);

    const embed = new MessageEmbed()
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:centro.sell.title'))
      .setColor(ctx.data.user.selectedColor);

    sellableItems.forEach((a, i) => {
      const resolvedItem = getItemById<DropItem>(a.id);
      if (embed.fields.length >= 25) return;
      embed.addField(
        ctx.locale(`items:${a.id as 1}.name`),
        `${ctx.locale('common:roleplay.level')} **${a.level}**\n${ctx.locale('common:amount')}: **${
          a.amount
        }**\n${ctx.locale('common:value')}: **${
          resolvedItem.data.marketValue + resolvedItem.data.perLevel * a.level
        }** ${emojis.coin}`,
        true,
      );

      for (let j = 0; j < a.amount; j++) {
        if (selectMenu.options.length >= 25) break;
        selectMenu.addOptions({
          label: `${ctx.locale(`items:${a.id as 1}.name`)} | ${ctx.locale(
            'common:roleplay.level',
          )} ${a.level}`,
          value: `${a.id} | ${a.level} | ${
            resolvedItem.data.marketValue + resolvedItem.data.perLevel * a.level
          } | ${i} | ${j}`,
        });
      }
    });

    selectMenu.setMaxValues(selectMenu.options.length).setMinValues(1);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selectMenu])] });

    const selectedItems =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        15000,
      );

    if (!selectedItems) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    const itemsSelected = selectedItems.values.map((a) => ({
      value: Number(resolveSeparatedStrings(a)[2]),
      item: getItemById<DropItem>(Number(resolveSeparatedStrings(a)[0])),
      level: Number(resolveSeparatedStrings(a)[1]),
    }));

    const itemValues = itemsSelected.reduce((p, c) => p + c.value, 0);

    user.money += itemValues;
    removeFromInventory(
      itemsSelected.map((a) => ({ id: a.item.id, level: a.level })),
      user.inventory,
    );

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      money: user.money,
      inventory: user.inventory,
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:centro.sell.success', { value: itemValues }),
      components: [],
      embeds: [],
    });
  }
}
