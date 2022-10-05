import { User } from 'discordeno/transformers';
import { ApplicationCommandOptionTypes, ButtonStyles, SelectMenuComponent } from 'discordeno/types';

import {
  createActionRow,
  createButton,
  createSelectMenu,
  disableComponents,
  generateCustomId,
  resolveCustomId,
  resolveSeparatedStrings,
} from '../../utils/discord/componentUtils';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import { ComponentInteraction, SelectMenuInteraction } from '../../types/interaction';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import userRepository from '../../database/repositories/userRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';

import { createCommand } from '../../structures/command/createCommand';

const ItemsCommand = createCommand({
  path: '',
  name: 'itens',
  nameLocalizations: { 'en-US': 'items' },
  description: '「📂」・Abre os itens de alguém',
  descriptionLocalizations: { 'en-US': "「📂」・Open someone's items" },
  category: 'info',
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionTypes.User,
      description: 'Usuário para mostrar os itens',
      descriptionLocalizations: { 'en-US': 'User to show items' },
      required: false,
    },
  ],
  authorDataFields: ['selectedColor', 'inUseItems', 'inventory', 'id', 'itemsLimit'],
  execute: async (ctx) => {
    const inputUser = ctx.getOption<User>('user', 'users', false) ?? ctx.author;
    const user =
      inputUser.id !== ctx.author.id ? await userRepository.findUser(inputUser.id) : ctx.authorData;

    if (!user)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:itens.no-user'),
        flags: MessageFlags.EPHEMERAL,
      });

    if (user.ban)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:itens.banned'),
        flags: MessageFlags.EPHEMERAL,
      });

    const embed = createEmbed({
      title: ctx.locale('commands:itens.title', { user: inputUser.username }),
      color: hexStringToNumber(user.selectedColor),
      fields: [],
    });

    if (user.inventory.length === 0) {
      embed.description = ctx.prettyResponse('error', 'commands:itens.no-item');
      return ctx.makeMessage({ embeds: [embed] });
    }

    const inventoryWithoutUsingItems = user.inventory.filter(
      (a) => !user.inUseItems.some((b) => b.id === a.id),
    );

    embed.fields?.push({
      name: ctx.locale('commands:itens.items'),
      value:
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
      inline: true,
    });

    embed.fields?.push({
      name: ctx.locale('commands:itens.active'),
      value:
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
      inline: true,
    });

    if (inputUser.id !== ctx.author.id) return ctx.makeMessage({ embeds: [embed] });

    const useItemButton = createButton({
      customId: generateCustomId('USE', ctx.interaction.id),
      label: ctx.locale('commands:itens.use'),
      style: ButtonStyles.Primary,
    });

    const resetItemsButton = createButton({
      customId: generateCustomId('RESET', ctx.interaction.id),
      label: ctx.locale('commands:itens.reset'),
      style: ButtonStyles.Danger,
    });

    const cannotUseItems = user.inventory.length === 0 || inventoryWithoutUsingItems.length === 0;

    if (cannotUseItems) useItemButton.disabled = true;
    if (user.inUseItems.length === 0) resetItemsButton.disabled = true;

    embed.footer = { text: ctx.locale('commands:itens.use-footer') };

    await ctx.makeMessage({
      embeds: [embed],
      components: [createActionRow([useItemButton, resetItemsButton])],
    });

    if (cannotUseItems && user.inUseItems.length === 0) return;

    const collected = await collectResponseComponentInteraction<ComponentInteraction>(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
      10_000,
    );

    if (!collected)
      return ctx.makeMessage({
        components: [
          createActionRow(
            disableComponents(ctx.locale('common:timesup'), [useItemButton, resetItemsButton]),
          ),
        ],
      });

    if (resolveCustomId(collected.data.customId) === 'RESET') {
      await userRepository.updateUser(ctx.author.id, {
        inUseItems: [],
      });

      return ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('success', 'commands:itens.reseted'),
      });
    }

    const availableItems = createSelectMenu({
      customId: generateCustomId('SELECT', ctx.interaction.id),
      placeholder: ctx.locale('commands:itens.select'),
      options: [],
    });

    inventoryWithoutUsingItems.forEach((item) => {
      availableItems.options.push({
        label: ctx.locale(`data:magic-items.${item.id as 1}.name`),
        description: ctx.locale(`data:magic-items.${item.id as 1}.description`).substring(0, 100),
        value: `${item.id}`,
      });
    });

    embed.description = ctx.locale('commands:itens.choose-item');

    ctx.makeMessage({ embeds: [embed], components: [createActionRow([availableItems])] });

    const selectedItem = await collectResponseComponentInteraction<SelectMenuInteraction>(
      ctx.channelId,
      ctx.author.id,
      `${ctx.interaction.id}`,
      10_000,
    );

    if (!selectedItem)
      return ctx.makeMessage({
        components: [
          createActionRow(disableComponents(ctx.locale('common:timesup'), [availableItems])),
        ],
      });

    const itemId = selectedItem.data.values[0];

    if (user.inUseItems.length >= user.itemsLimit) {
      const replaceItem = createSelectMenu({
        customId: generateCustomId('TOGGLE', ctx.interaction.id),
        placeholder: ctx.locale('commands:itens.select'),
        options: user.inUseItems.reduce<SelectMenuComponent['options']>((p, c, i) => {
          p.push({
            label: ctx.locale(`data:magic-items.${c.id as 1}.name`),
            description: ctx.locale(`data:magic-items.${c.id as 1}.description`).substring(0, 100),
            value: `${c.id} | ${i}`,
          });
          return p;
        }, []),
      });

      embed.description = ctx.locale('commands:itens.choose-toggle');

      ctx.makeMessage({ components: [createActionRow([replaceItem])], embeds: [embed] });

      const choosedReplace = await collectResponseComponentInteraction<SelectMenuInteraction>(
        ctx.channelId,
        ctx.author.id,
        `${ctx.interaction.id}`,
        10_000,
      );

      if (!choosedReplace)
        return ctx.makeMessage({
          components: [
            createActionRow(disableComponents(ctx.locale('common:timesup'), [replaceItem])),
          ],
        });

      const [replaceItemId] = resolveSeparatedStrings(choosedReplace.data.values[0]);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user.inUseItems.find((i) => i.id === Number(replaceItemId))!.id = Number(itemId);
    } else user.inUseItems.push({ id: Number(itemId) });

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:itens.equipped', {
        name: ctx.locale(`data:magic-items.${itemId as '1'}.name`),
      }),
    });

    userRepository.updateUser(ctx.author.id, { inUseItems: user.inUseItems });
  },
});

export default ItemsCommand;
