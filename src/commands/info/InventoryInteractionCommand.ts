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
import { IMagicItem } from '@utils/Types';
import Util, {
  actionRow,
  disableComponents,
  resolveCustomId,
  resolveSeparatedStrings,
} from '@utils/Util';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'inventario',
      description: '「📂」・Abre o inventário de alguém',
      category: 'info',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para abrir o inventário',
          required: false,
        },
      ],
      cooldown: 7,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['selectedColor', 'inUseItems', 'inventory', 'id'],
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
        content: ctx.prettyResponse('error', 'commands:inventario.no-user'),
        ephemeral: true,
      });
      return;
    }

    if (user.ban) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:inventario.banned') });
    }

    const embed = new MessageEmbed()
      .setTitle(
        ctx.locale('commands:inventario.title', {
          user: ctx.options.getUser('user')?.username ?? ctx.author.username,
        }),
      )
      .setColor(user.selectedColor);

    if (user.inventory.length === 0 && user.inUseItems.length === 0) {
      embed.setDescription(ctx.prettyResponse('error', 'commands:inventario.no-item'));
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    embed.addField(
      ctx.locale('commands:inventario.items'),
      user.inventory.length > 0
        ? user.inventory.reduce(
            (p, c) =>
              `${p}**${ctx.locale('common:name')}:** ${ctx.locale(
                `data:magic-items.${c.id as 1}.name`,
                // ` data:magic-items.${c.id}.name`,
              )}\n**${ctx.locale('common:description')}**: ${ctx.locale(
                `data:magic-items.${c.id as 1}.description`,
              )}\n`,
            '',
          )
        : ctx.locale('commands:inventario.no-item'),
      true,
    );

    embed.addField(
      ctx.locale('commands:inventario.active'),
      user.inUseItems.length > 0
        ? user.inUseItems.reduce(
            (p, c) =>
              `${p}**${ctx.locale('common:name')}:** ${ctx.locale(
                `data:magic-items.${c.id as 1}.name`,
              )}\n**${ctx.locale('common:description')}**: ${ctx.locale(
                `data:magic-items.${c.id as 1}.description`,
              )}\n`,
            '',
          )
        : ctx.locale('commands:inventario.no-item'),
      true,
    );

    if (user.id !== ctx.author.id) {
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const useItemButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | USE`)
      .setLabel(ctx.locale('commands:inventario.use'))
      .setStyle('PRIMARY');

    const resetItemsButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | RESET`)
      .setLabel(ctx.locale('commands:inventario.reset'))
      .setStyle('DANGER');

    const canUseItems = !(
      user.inventory.length === 0 ||
      user.inventory.every((a) => user.inUseItems.some((b) => b.id === a.id))
    );

    const canResetItems = user.inUseItems.length > 0;

    if (!canUseItems) useItemButton.setDisabled(true);
    if (!canResetItems) resetItemsButton.setDisabled(true);

    await ctx.makeMessage({
      embeds: [embed.setFooter(ctx.locale('commands:inventario.use-footer'))],
      components: [actionRow([useItemButton, resetItemsButton])],
    });

    if (!canUseItems && !canResetItems) return;

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
      user.inUseItems.forEach((a) => {
        user.inventory.push({
          id: a.id,
        });
      });

      user.inUseItems = [];

      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('success', 'commands:inventario.reseted'),
      });

      ctx.client.repositories.userRepository.update(ctx.author.id, {
        inventory: user.inventory,
        inUseItems: user.inUseItems,
      });
      return;
    }

    const availableItems = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | USE`)
      .setPlaceholder(ctx.locale('commands:inventario.select'))
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        user.inventory.reduce<MessageSelectOptionData[]>((p, c) => {
          if (user.inUseItems.some((a) => a.id === c.id)) return p;

          p.push({
            label: ctx.locale(`data:magic-items.${c.id as 1}.name`),
            description: ctx.locale(`data:magic-items.${c.id as 1}.description`),
            value: `${c.id}`,
          });
          return p;
        }, []),
      );

    embed.setDescription(ctx.locale('commands:inventario.choose-item'));

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

    const [itemId] = resolveSeparatedStrings(selectedItem.values[0]);

    const findedItem = user.inventory.find((a) => a.id === Number(itemId)) as IMagicItem & {
      amount: number;
    };

    if (user.inUseItems.length >= user.itemsLimit) {
      const replaceItem = new MessageSelectMenu()
        .setCustomId(`${ctx.interaction.id} | TOGGLE`)
        .setMaxValues(1)
        .setMinValues(1)
        .setPlaceholder(ctx.locale('commands:inventario.select'))
        .setOptions(
          user.inUseItems.reduce<MessageSelectOptionData[]>((p, c, i) => {
            p.push({
              label: ctx.locale(`data:magic-items.${c.id as 1}.name`),
              description: ctx.locale(`data:magic-items.${c.id as 1}.description`),
              value: `${c.id} | ${i}`,
            });
            return p;
          }, []),
        );

      ctx.makeMessage({
        components: [actionRow([replaceItem])],
        embeds: [embed.setDescription('choose-toggle')],
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

      user.inUseItems.splice(user.inUseItems.findIndex((a) => a.id === Number(replaceItemId), 1));
      user.inventory.push({
        id: Number(replaceItemId),
      });
    }

    findedItem.amount -= 1;

    user.inUseItems.push({ id: Number(itemId) });

    if (findedItem.amount === 0)
      user.inventory.splice(
        user.inventory.findIndex((a) => a.id === Number(itemId)),
        1,
      );

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:inventario.equipped', {
        name: ctx.locale(`data:magic-items.${Number(itemId) as 1}.name`),
      }),
    });

    ctx.client.repositories.userRepository.update(ctx.author.id, {
      inventory: user.inventory,
      inUseItems: user.inUseItems,
    });
  }
}
