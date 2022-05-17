import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  MessageEmbed,
  MessageButton,
  ButtonInteraction,
  SelectMenuInteraction,
  MessageSelectMenu,
  MessageSelectOptionData,
} from 'discord.js-light';
import Util, {
  actionRow,
  disableComponents,
  resolveCustomId,
  resolveSeparatedStrings,
} from '@utils/Util';
import { IMagicItem } from '@custom_types/Menhera';

export default class ItemsCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'ítens',
      nameLocalizations: { 'en-US': 'items' },
      description: '「📂」・Abre os itens de alguém',
      descriptionLocalizations: { 'en-US': "「📂」・Open someone's items" },
      category: 'info',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para mostrar os itens',
          descriptionLocalizations: { 'en-US': 'User to show items' },
          required: false,
        },
      ],
      cooldown: 10,
      authorDataFields: ['selectedColor', 'inUseItems', 'inventory', 'id', 'itemsLimit'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user =
      ctx.options.getUser('user') && ctx.options.getUser('user', true).id !== ctx.author.id
        ? await ctx.client.repositories.userRepository.find(ctx.options.getUser('user', true).id, [
            'selectedColor',
            'inUseItems',
            'inventory',
            'itemsLimit',
            'ban',
            'id',
          ])
        : ctx.data.user;

    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:itens.no-user'),
        ephemeral: true,
      });
      return;
    }

    if (user.ban) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:itens.banned') });
      return;
    }

    // ========================= UNDO THE BUG =======================================

    // TODO: Remove this in the future with the duplicata bug

    const hasDuplicata = (inv: IMagicItem[]): [boolean, IMagicItem[]] => {
      const result = inv.reduce<IMagicItem[]>((p, c) => {
        if (p.some((b) => b.id === c.id)) return p;
        p.push(c);
        return p;
      }, []);

      return [result.length !== inv.length, result];
    };

    const [[hasInventoryDuplicated, newInventory], [hasInUseDuplicated, newInUse]] = [
      hasDuplicata(user.inventory),
      hasDuplicata(user.inUseItems),
    ];

    if (hasInventoryDuplicated) user.inventory = newInventory;
    if (hasInUseDuplicated) user.inUseItems = newInUse;

    // ========================= FINISHED UNDO THE BUG =======================================

    const embed = new MessageEmbed()
      .setTitle(
        ctx.locale('commands:itens.title', {
          user: ctx.options.getUser('user')?.username ?? ctx.author.username,
        }),
      )
      .setColor(user.selectedColor);

    if (user.inventory.length === 0) {
      embed.setDescription(ctx.prettyResponse('error', 'commands:itens.no-item'));
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const inventoryWithoutUsingItems = user.inventory.filter(
      (a) => !user.inUseItems.some((b) => a.id === b.id),
    );

    embed.addField(
      ctx.locale('commands:itens.items'),
      inventoryWithoutUsingItems.length > 0
        ? inventoryWithoutUsingItems.reduce(
            (p, c) =>
              `${p}**${ctx.locale('common:name')}:** ${ctx.locale(
                `data:magic-items.${c.id as 1}.name`,
              )}\n**${ctx.locale('common:description')}**: ${ctx.locale(
                `data:magic-items.${c.id as 1}.description`,
              )}\n\n`,
            '',
          )
        : ctx.locale('commands:itens.no-item'),
      true,
    );

    embed.addField(
      ctx.locale('commands:itens.active'),
      user.inUseItems.length > 0
        ? user.inUseItems.reduce(
            (p, c) =>
              `${p}**${ctx.locale('common:name')}:** ${ctx.locale(
                `data:magic-items.${c.id as 1}.name`,
              )}\n**${ctx.locale('common:description')}**: ${ctx.locale(
                `data:magic-items.${c.id as 1}.description`,
              )}\n\n`,
            '',
          )
        : ctx.locale('commands:itens.no-item'),
      true,
    );

    if (user.id !== ctx.author.id) {
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const useItemButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | USE`)
      .setLabel(ctx.locale('commands:itens.use'))
      .setStyle('PRIMARY');

    const resetItemsButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | RESET`)
      .setLabel(ctx.locale('commands:itens.reset'))
      .setStyle('DANGER');

    const canUseItems = !(user.inventory.length === 0 || inventoryWithoutUsingItems.length === 0);

    if (!canUseItems) useItemButton.setDisabled(true);
    if (user.inUseItems.length === 0) resetItemsButton.setDisabled(true);

    await ctx.makeMessage({
      embeds: [embed.setFooter({ text: ctx.locale('commands:itens.use-footer') })],
      components: [actionRow([useItemButton, resetItemsButton])],
    });

    if (!canUseItems && user.inUseItems.length === 0) return;

    const collected = await Util.collectComponentInteractionWithStartingId<ButtonInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7000,
    );

    if (!collected) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [useItemButton]))],
      });
      return;
    }

    if (resolveCustomId(collected.customId) === 'RESET') {
      // TODO: Remove this in the future with the duplicata bug
      user.inUseItems.forEach((a) => {
        if (!user.inventory.some((b) => b.id === a.id)) user.inventory.push({ id: a.id });
      });

      user.inUseItems = [];

      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('success', 'commands:itens.reseted'),
      });

      await ctx.client.repositories.userRepository.update(ctx.author.id, {
        inventory: user.inventory, // TODO: Remove this in the future with the duplicata bug
        inUseItems: user.inUseItems,
      });
      return;
    }

    const availableItems = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setPlaceholder(ctx.locale('commands:itens.select'))
      .setMinValues(1)
      .setMaxValues(1);

    inventoryWithoutUsingItems.forEach((item) =>
      availableItems.addOptions({
        label: ctx.locale(`data:magic-items.${item.id as 1}.name`),
        description: ctx.locale(`data:magic-items.${item.id as 1}.description`).substring(0, 100),
        value: `${item.id}`,
      }),
    );

    embed.setDescription(ctx.locale('commands:itens.choose-item'));

    ctx.makeMessage({ embeds: [embed], components: [actionRow([availableItems])] });

    const selectedItem =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        7000,
      );

    if (!selectedItem) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [availableItems]))],
      });
      return;
    }

    const itemId = selectedItem.values[0];

    if (user.inUseItems.length >= user.itemsLimit) {
      const replaceItem = new MessageSelectMenu()
        .setCustomId(`${ctx.interaction.id} | TOGGLE`)
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder(ctx.locale('commands:itens.select'))
        .setOptions(
          user.inUseItems.reduce<MessageSelectOptionData[]>((p, c, i) => {
            p.push({
              label: ctx.locale(`data:magic-items.${c.id as 1}.name`),
              description: ctx
                .locale(`data:magic-items.${c.id as 1}.description`)
                .substring(0, 100),
              value: `${c.id} | ${i}`,
            });
            return p;
          }, []),
        );

      ctx.makeMessage({
        components: [actionRow([replaceItem])],
        embeds: [embed.setDescription(ctx.locale('commands:itens.choose-toggle'))],
      });

      const choosedReplace =
        await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
          ctx.channel,
          ctx.author.id,
          ctx.interaction.id,
          7000,
        );

      if (!choosedReplace) {
        ctx.makeMessage({
          components: [actionRow(disableComponents(ctx.locale('common:timesup'), [replaceItem]))],
        });
        return;
      }

      const [replaceItemId] = resolveSeparatedStrings(choosedReplace.values[0]);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user.inUseItems.find((a) => a.id === Number(replaceItemId))!.id = Number(itemId);
    }

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:itens.equipped', {
        name: ctx.locale(`data:magic-items.${Number(itemId) as 1}.name`),
      }),
    });

    user.inUseItems.push({ id: Number(itemId) });

    ctx.client.repositories.userRepository.update(ctx.author.id, {
      inventory: user.inventory,
      inUseItems: user.inUseItems,
    });
  }
}
