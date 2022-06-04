import { ConsumableItem, DropItem, LeveledItem, RoleplayUserSchema } from '@roleplay/Types';
import {
  addToInventory,
  getFreeInventorySpace,
  makeCloseCommandButton,
  removeFromInventory,
} from '@roleplay/utils/AdventureUtils';
import { getAllForgeableItems, packDrops, userHasAllDrops } from '@roleplay/utils/BlacksmithUtils';
import { checkAbilityByUnknownId, getEquipmentById, getItemById } from '@roleplay/utils/DataUtils';
import { availableToBuyItems } from '@roleplay/utils/ItemsUtil';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/Constants';
import Util, {
  actionRow,
  disableComponents,
  makeCustomId,
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

export default class DowntownCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'centro',
      nameLocalizations: { 'en-US': 'downtown' },
      description: '【ＲＰＧ】🏛️ | Centro de Boleham, aqui tu encontra de tudo',
      descriptionLocalizations: {
        'en-US': '【ＲＰＧ】🏛️ | Boleham Center, here you can find everything',
      },
      category: 'roleplay',
      options: [
        {
          name: 'biblioteca',
          nameLocalizations: { 'en-US': 'library' },
          description: '【ＲＰＧ】📖 | Veja informações sobre o Mundo de Boleham',
          descriptionLocalizations: {
            'en-US': "【ＲＰＧ】📖 | See information about Boleham's World",
          },
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'sessão',
              nameLocalizations: { 'en-US': 'section' },
              description: 'Tu tá procurando informações sobre o que?',
              descriptionLocalizations: { 'en-US': 'What are you looking for information about?' },
              type: 'STRING',
              required: true,
              choices: [
                {
                  name: 'habilidades',
                  nameLocalizations: { 'en-US': 'abilities' },
                  value: 'abilities',
                },
                // { name: 'itens', value: 'items' },
              ],
            },
            {
              name: 'id',
              description: 'ID do objeto que você está procurando',
              descriptionLocalizations: { 'en-US': 'ID of the object you are looking for' },
              type: 'INTEGER',
              autocomplete: true,
              required: true,
            },
          ],
        },
        {
          name: 'guilda',
          nameLocalizations: { 'en-US': 'guild' },
          description: '【ＲＰＧ】🏠 | Retire quests e reivindique-as',
          descriptionLocalizations: { 'en-US': '【ＲＰＧ】🏠 | Remove quests and claim them' },
          type: 'SUB_COMMAND',
        },
        {
          name: 'ferreiro',
          nameLocalizations: { 'en-US': 'blacksmith' },
          description: '【ＲＰＧ】⚒️ | Compre e faça itens de batalha',
          descriptionLocalizations: { 'en-US': '【ＲＰＧ】⚒️ | Buy and make battle items' },
          type: 'SUB_COMMAND',
        },
        {
          name: 'mercado',
          nameLocalizations: { 'en-US': 'market' },
          description: '【ＲＰＧ】🛒 | Compre e venda itens',
          descriptionLocalizations: { 'en-US': '【ＲＰＧ】🛒 | buy and sell items' },
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'comprar',
              nameLocalizations: { 'en-US': 'buy' },
              description: '【ＲＰＧ】🛒 | Compre itens para lhe ajudar nas batalhas',
              descriptionLocalizations: {
                'en-US': '【ＲＰＧ】🛒 | Buy items to help you in battles',
              },
              type: 'SUB_COMMAND',
            },
            {
              name: 'vender',
              nameLocalizations: { 'en-US': 'sell' },
              description: '【ＲＰＧ】🛒 | Venda espólios de batalha para conseguir Moedas Reais',
              descriptionLocalizations: {
                'en-US': '【ＲＰＧ】🛒 | Sell ​​battle loot to get Royal Coins',
              },
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

    if (option === 'vender') return DowntownCommand.sellItems(ctx, user);

    if (option === 'comprar') return DowntownCommand.buyItems(ctx, user);

    if (option === 'ferreiro') return DowntownCommand.blacksmith(ctx, user);

    if (option === 'biblioteca') return DowntownCommand.library(ctx, user);

    if (option === 'guilda')
      ctx.makeMessage({ content: ctx.prettyResponse('wink', 'common:soon'), ephemeral: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async library(ctx: InteractionCommandContext, user: RoleplayUserSchema): Promise<void> {
    const bookId = ctx.options.getInteger('id', true);
    const selectedOption = ctx.options.getString('sessão', true);

    const embed = new MessageEmbed()
      .setTitle(
        ctx.locale('commands:centro.library.title', {
          session: ctx.locale(`commands:centro.library.${selectedOption as 'items'}.title`),
        }),
      )
      .setColor(ctx.data.user.selectedColor);

    switch (selectedOption) {
      case 'items': {
        const item = getItemById(bookId);

        if (item.data === null) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'commands:centro.library.items.not-found'),
          });
          return;
        }

        embed.setDescription(
          `**${ctx.locale('commands:centro.library.items.name')}**: ${ctx.locale(
            `items:${bookId as 1}.name`,
          )}`,
        );
        ctx.makeMessage({ embeds: [embed] });
        break;
      }
      case 'abilities': {
        const ability = checkAbilityByUnknownId(bookId);

        if (!ability) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'commands:centro.library.abilities.not-found'),
          });
          return;
        }

        embed
          .setDescription(
            ctx.locale('commands:centro.library.abilities.description', {
              name: ctx.locale(`abilities:${ability.id as 100}.name`),
              description: ctx.locale(`abilities:${ability.id as 100}.description`),
              cost: ability.data.cost,
              costPerLevel: ability.data.costPerLevel,
              unlockCost: ability.data.unlockCost,
            }),
          )
          .addField('\u200b', ctx.locale('commands:centro.library.abilities.effects'), false);

        ability.data.effects.forEach((effect) => {
          embed.addField(
            '\u200b',
            ctx.locale('commands:centro.library.abilities.effect-description', {
              duration: effect.durationInTurns,
              type: ctx.locale(`commands:centro.library.abilities.${effect.effectType}`),
              value: effect.effectValue,
              inIntelligence: effect.effectValueByIntelligence,
              modifier: ctx.locale(
                `commands:centro.library.abilities.${effect.effectValueModifier}`,
              ),
              valuePerLevel: effect.effectValuePerLevel,
              element: ctx.locale(`common:roleplay.elements.${effect.element}`),
              reflection: ctx.locale(
                `commands:centro.library.abilities.${effect.effectValueRefflection}`,
              ),
              target: ctx.locale(`commands:centro.library.abilities.${effect.target}`),
            }),
            true,
          );
        });

        ctx.makeMessage({ embeds: [embed] });
      }
    }
  }

  static async blacksmith(ctx: InteractionCommandContext, user: RoleplayUserSchema): Promise<void> {
    const userBackpack = getEquipmentById<'backpack'>(user.backpack.id);
    const userWeapon = getEquipmentById<'weapon'>(user.weapon.id);
    const userProtection = getEquipmentById<'protection'>(user.protection.id);

    const isBackpackAtMaxLevel =
      typeof userBackpack.data.levels[user.backpack.level + 1] === 'undefined';

    const isWeaponAtMaxLevel = typeof userWeapon.data.levels[user.weapon.level + 1] === 'undefined';

    const isProtectionAtMaxLevel =
      typeof userProtection.data.levels[user.protection.level + 1] === 'undefined';

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
            capacity: userBackpack.data.levels[user.backpack.level].value,
            max: isBackpackAtMaxLevel ? ctx.locale('commands:centro.blacksmith.max-level') : '',
          }),
          inline: true,
        },
        {
          name: ctx.prettyResponse('damage', 'common:roleplay.weapon'),
          value: ctx.locale('commands:centro.blacksmith.weapon-description', {
            name: ctx.locale(`items:${user.weapon.id as 1}.name`),
            level: user.weapon.level,
            damage: userWeapon.data.levels[user.weapon.level].value,
            max: isWeaponAtMaxLevel ? ctx.locale('commands:centro.blacksmith.max-level') : '',
          }),
          inline: true,
        },
        {
          name: ctx.prettyResponse('armor', 'common:roleplay.protection'),
          value: ctx.locale('commands:centro.blacksmith.protection-description', {
            name: ctx.locale(`items:${user.protection.id as 1}.name`),
            level: user.protection.level,
            armor: userProtection.data.levels[user.protection.level].value,
            max: isProtectionAtMaxLevel ? ctx.locale('commands:centro.blacksmith.max-level') : '',
          }),
          inline: true,
        },
      ]);

    const [backpackId, baseId] = makeCustomId('UPGRADE_BACKPACK');

    const upgradeBackpackButton = new MessageButton()
      .setCustomId(backpackId)
      .setLabel(ctx.locale('commands:centro.blacksmith.upgrade-backpack'))
      .setStyle('PRIMARY')
      .setDisabled(isBackpackAtMaxLevel);

    const upgradeWeaponButton = new MessageButton()
      .setCustomId(makeCustomId('UPGRADE_WEAPON', baseId)[0])
      .setLabel(ctx.locale('commands:centro.blacksmith.upgrade-weapon'))
      .setStyle('PRIMARY')
      .setDisabled(isWeaponAtMaxLevel);

    const upgradeProtectionButton = new MessageButton()
      .setCustomId(makeCustomId('UPGRADE_PROTECTION', baseId)[0])
      .setLabel(ctx.locale('commands:centro.blacksmith.upgrade-protection'))
      .setStyle('PRIMARY')
      .setDisabled(isProtectionAtMaxLevel);

    const forgeBackpackButton = new MessageButton()
      .setCustomId(makeCustomId('FORGE_BACKPACK', baseId)[0])
      .setLabel(ctx.locale('commands:centro.blacksmith.forge-backpack'))
      .setStyle('PRIMARY');

    const forgeWeaponButton = new MessageButton()
      .setCustomId(makeCustomId('FORGE_WEAPON', baseId)[0])
      .setLabel(ctx.locale('commands:centro.blacksmith.forge-weapon'))
      .setStyle('PRIMARY');

    const forgeProtectionButton = new MessageButton()
      .setCustomId(makeCustomId('FORGE_PROTECTION', baseId)[0])
      .setLabel(ctx.locale('commands:centro.blacksmith.forge-protection'))
      .setStyle('PRIMARY');

    const exitButton = makeCloseCommandButton(baseId, ctx.i18n);

    ctx.makeMessage({
      embeds: [embed],
      components: [
        actionRow([upgradeBackpackButton, upgradeWeaponButton, upgradeProtectionButton]),
        actionRow([forgeBackpackButton, forgeWeaponButton, forgeProtectionButton, exitButton]),
      ],
    });

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      baseId,
      13_000,
    );

    if (!selected) {
      ctx.makeMessage({
        components: [
          actionRow(
            disableComponents(ctx.locale('common:timesup'), [
              upgradeBackpackButton,
              upgradeWeaponButton,
              upgradeProtectionButton,
            ]),
          ),
          actionRow(
            disableComponents(ctx.locale('common:timesup'), [
              forgeBackpackButton,
              forgeWeaponButton,
              forgeProtectionButton,
              exitButton,
            ]),
          ),
        ],
      });
      return;
    }

    if (resolveCustomId(selected.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
    }

    const wannaUpgrade = resolveCustomId(selected.customId).startsWith('UPGRADE');
    const fieldToUse = resolveCustomId(selected.customId).split('_')[1].toLowerCase() as
      | 'backpack'
      | 'weapon'
      | 'protection';

    if (wannaUpgrade) {
      const [upgradeId, newId] = makeCustomId('UPGRADE');

      const upgradeButton = new MessageButton()
        .setStyle('SUCCESS')
        .setCustomId(upgradeId)
        .setLabel(ctx.locale('commands:centro.blacksmith.upgrade'));

      const toUpgrade = {
        backpack: userBackpack.data.levels[user.backpack.level + 1],
        weapon: userWeapon.data.levels[user.weapon.level + 1],
        protection: userProtection.data.levels[user.protection.level + 1],
      }[fieldToUse];

      const bonusEmoji =
        // eslint-disable-next-line no-nested-ternary
        fieldToUse === 'backpack'
          ? emojis.chest
          : fieldToUse === 'weapon'
          ? emojis.damage
          : emojis.armor;

      const costToUpgrade = toUpgrade.cost * user[fieldToUse].level;
      const itemsToUpgrade = packDrops(toUpgrade.items);

      embed.setFields([]).setDescription(
        ctx.locale('commands:centro.blacksmith.evolve-description', {
          cost: costToUpgrade,
          name: ctx.locale(`items:${user[fieldToUse].id as 1}.name`),
          level: user.protection.level + 1,
          bonus: toUpgrade.value,
          bonusEmoji,
          coinEmoji: emojis.coin,
          items:
            itemsToUpgrade.length === 0
              ? ctx.locale('commands:centro.blacksmith.none')
              : itemsToUpgrade
                  .map((a) => `${a.amount}x **${ctx.locale(`items:${a.id as 1}.name`)}**`)
                  .join(', '),
        }),
      );

      if (costToUpgrade > user.money)
        upgradeButton.setDisabled(true).setLabel(ctx.locale('commands:centro.blacksmith.poor'));

      if (!userHasAllDrops(user.inventory, itemsToUpgrade))
        upgradeButton
          .setDisabled(true)
          .setLabel(ctx.locale('commands:centro.blacksmith.poor-items'));

      if (upgradeButton.disabled) exitButton.setDisabled(true);

      ctx.makeMessage({
        components: [
          actionRow([
            upgradeButton,
            exitButton.setCustomId(makeCustomId('CLOSE_COMMAND', newId)[0]),
          ]),
        ],
        embeds: [embed],
      });

      if (upgradeButton.disabled) return;

      const confirmUpgrade = await Util.collectComponentInteractionWithStartingId(
        ctx.channel,
        ctx.author.id,
        newId,
        12_000,
      );

      if (!confirmUpgrade) {
        ctx.makeMessage({
          components: [actionRow(disableComponents(ctx.locale('common:timesup'), [upgradeButton]))],
        });
        return;
      }

      if (resolveCustomId(confirmUpgrade.customId) === 'CLOSE_COMMAND') {
        ctx.deleteReply();
        return;
      }

      user[fieldToUse].level += 1;

      removeFromInventory(
        toUpgrade.items.map((a) => ({ id: a, level: 1 })),
        user.inventory,
      );

      await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
        $inc: { money: negate(costToUpgrade) },
        [fieldToUse]: user[fieldToUse],
        inventory: user.inventory,
      });

      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('success', 'commands:centro.blacksmith.success'),
      });

      return;
    }

    const availableToForge = getAllForgeableItems(fieldToUse);

    if (availableToForge.length === 0) {
      embed.setFields([]).setDescription(ctx.locale('commands:centro.blacksmith.no-forgeable'));

      ctx.makeMessage({ embeds: [embed], components: [] });
      return;
    }

    const [menuId, newId] = makeCustomId('SELECT');
    const itemSelector = new MessageSelectMenu()
      .setCustomId(menuId)
      .setMinValues(1)
      .setMaxValues(1);

    embed.setFields([]).setDescription('');
    availableToForge.forEach((item) => {
      const toForge = item.data.levels[1];
      const itemsToForge = packDrops(toForge.items);
      const hasMoney = user.money >= toForge.cost;
      const hasItems = userHasAllDrops(user.inventory, itemsToForge);
      embed.addField(
        ctx.locale(`items:${item.id as 1}.name`),
        ctx.locale('commands:centro.blacksmith.forge-item-description', {
          field: ctx.locale(`commands:centro.blacksmith.fields.${fieldToUse}`),
          value: toForge.value,
          cost: toForge.cost,
          noMoney: !hasMoney ? `| \`${ctx.locale('commands:centro.blacksmith.poor')}\`` : '',
          noItems: !hasItems
            ? `\n| \`${ctx.locale('commands:centro.blacksmith.poor-items')}\``
            : '',
          items:
            itemsToForge.length === 0
              ? ctx.locale('commands:centro.blacksmith.none')
              : itemsToForge
                  .map((a) => `\n• ${a.amount}x **${ctx.locale(`items:${a.id as 1}.name`)}**`)
                  .join(''),
        }),
        true,
      );

      if (hasItems && hasMoney)
        itemSelector.addOptions({
          label: ctx.locale(`items:${item.id as 1}.name`),
          value: `${item.id}`,
        });
    });

    if (itemSelector.options.length === 0) {
      itemSelector.setDisabled(true).setOptions({ label: 'a', value: 'a' });
      exitButton.setDisabled(true);
    }

    ctx.makeMessage({
      embeds: [embed],
      components: [
        actionRow([itemSelector]),
        actionRow([exitButton.setCustomId(makeCustomId('CLOSE_COMMAND', newId)[0])]),
      ],
    });

    if (itemSelector.disabled) return;

    const selectedForge =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        newId,
        15_000,
      );

    if (!selectedForge) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [itemSelector]))],
      });
      return;
    }

    if (resolveCustomId(selectedForge.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const toForgeItem = availableToForge.find(
      (item) => item.id === Number(selectedForge.values[0]),
    );

    if (!toForgeItem) {
      ctx.deleteReply();
      return;
    }

    removeFromInventory(
      toForgeItem.data.levels[1].items.map((a) => ({ id: a, level: 1 })),
      user.inventory,
    );

    if (getFreeInventorySpace(user) < 1) {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'commands:centro.blacksmith.no-space'),
      });
      return;
    }

    addToInventory([{ id: toForgeItem.id, level: 1 }], user.inventory);

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      $inc: { money: negate(toForgeItem.data.levels[1].cost) },
      inventory: user.inventory,
    });
  }

  static async buyItems(ctx: InteractionCommandContext, user: RoleplayUserSchema): Promise<void> {
    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:centro.buy.title'));

    const [selectorId, baseId] = makeCustomId('BUY');

    const selector = new MessageSelectMenu()
      .setCustomId(selectorId)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.locale('commands:centro.buy.select'));

    const exitButton = makeCloseCommandButton(baseId, ctx.i18n);

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

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([exitButton]), actionRow([selector])],
    });

    const selectedItem =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        baseId,
        9000,
      );

    if (!selectedItem) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selector]))],
      });
      return;
    }

    if (resolveCustomId(selectedItem.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
      return;
    }

    const [newSelectorId, newId] = makeCustomId('BUY');

    selector
      .setOptions([])
      .setPlaceholder(ctx.locale('commands:centro.buy.select-amount'))
      .setCustomId(newSelectorId);

    for (let i = 1; i <= 25; i++) selector.addOptions({ label: `${i}`, value: `${i}` });

    ctx.makeMessage({
      components: [
        actionRow([exitButton.setCustomId(makeCustomId('CLOSE_BUTTON', newId)[0])]),
        actionRow([selector]),
      ],
    });

    const selectedAmount =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        newId,
        8000,
      );

    if (!selectedAmount || !selectedAmount.values) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selector]))],
      });
      return;
    }

    if (resolveCustomId(selectedItem.customId) === 'CLOSE_COMMAND') {
      ctx.deleteReply();
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
        coinEmoji: emojis.coin,
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

    const [sellCustomId, baseId] = makeCustomId('SELL');

    const selectMenu = new MessageSelectMenu()
      .setCustomId(sellCustomId)
      .addOptions({ label: ctx.locale('commands:centro.sell.sell-all'), value: 'ALL' });

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
        }**\n${ctx.locale('common:value')}: **${resolvedItem.data.marketValue}** ${emojis.coin}`,
        true,
      );

      for (let j = 0; j < a.amount; j++) {
        if (selectMenu.options.length >= 25) break;
        selectMenu.addOptions({
          label: `${ctx.locale(`items:${a.id as 1}.name`)} | ${ctx.locale(
            'common:roleplay.level',
          )} ${a.level}`,
          value: `${a.id} | ${a.level} | ${resolvedItem.data.marketValue} | ${i} | ${j}`,
        });
      }
    });

    selectMenu.setMaxValues(selectMenu.options.length).setMinValues(1);

    const closeCommand = makeCloseCommandButton(baseId, ctx.i18n);

    ctx.makeMessage({
      embeds: [embed],
      components: [actionRow([closeCommand]), actionRow([selectMenu])],
    });

    const selectedItems =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        baseId,
        15000,
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

    if (selectedItems.values.includes('ALL')) {
      const totalMoney = sellableItems.reduce((p, c) => {
        const resolvedItem = getItemById<DropItem>(c.id);
        const itemValue = resolvedItem.data.marketValue * c.amount;
        removeFromInventory(Array(c.amount).fill({ id: c.id, level: c.level }), user.inventory);
        return p + itemValue;
      }, 0);

      await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
        $inc: { money: totalMoney },
        inventory: user.inventory,
      });

      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:centro.sell.success', {
          value: totalMoney,
          coinEmoji: emojis.coin,
        }),
        embeds: [],
        components: [],
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
      content: ctx.prettyResponse('success', 'commands:centro.sell.success', {
        value: itemValues,
        coinEmoji: emojis.coin,
      }),
      components: [],
      embeds: [],
    });
  }
}
