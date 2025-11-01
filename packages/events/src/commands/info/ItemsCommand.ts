import { ApplicationCommandOptionTypes, ButtonStyles } from '@discordeno/bot';

import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import userRepository from '../../database/repositories/userRepository.js';
import { MessageFlags } from "@discordeno/bot";

import { createCommand } from '../../structures/command/createCommand.js';
import { User } from '../../types/discordeno.js';

const selectedToUseExecutor = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const selectedItems = ctx.interaction.data.values;

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:itens.equipped', {
      items: selectedItems.map((a) => ctx.locale(`data:magic-items.${a as '1'}.name`)).join(', '),
    }),
  });

  userRepository.updateUser(ctx.user.id, {
    inUseItems: selectedItems.map((a) => ({ id: Number(a) })),
  });
};

const buttonClickExecutor = async (ctx: ComponentInteractionContext): Promise<void> => {
  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  const [buttonClicked] = ctx.sentData;

  if (buttonClicked === 'RESET') {
    await userRepository.updateUser(ctx.user.id, {
      inUseItems: [],
    });

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:itens.reseted'),
    });

    return;
  }

  const availableItems = createSelectMenu({
    customId: createCustomId(1, ctx.user.id, ctx.originalInteractionId, 'SELECT'),
    placeholder: ctx.locale('commands:itens.select'),
    options: authorData.inventory.map((item) => ({
      label: ctx.locale(`data:magic-items.${item.id as 1}.name`),
      value: `${item.id}`,
      default: authorData.inUseItems.some((a) => a.id === item.id),
      description: ctx.locale(`data:magic-items.${item.id as 1}.description`).substring(0, 100),
    })),
    maxValues: 2,
  });

  if (availableItems.options.length < 2) availableItems.maxValues = 1;

  const inventoryWithoutUsingItems = authorData.inventory.filter(
    (a) => !authorData.inUseItems.some((b) => b.id === a.id),
  );

  const embed = createEmbed({
    title: ctx.locale('commands:itens.title', { user: ctx.user.username }),
    color: hexStringToNumber(authorData.selectedColor),
    description: ctx.locale('commands:itens.choose-item'),
    footer: { text: ctx.locale('commands:itens.use-footer') },
    fields: [
      {
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
      },
      {
        name: ctx.locale('commands:itens.active'),
        value:
          authorData.inUseItems.length > 0
            ? authorData.inUseItems.reduce(
                (p, c) =>
                  `${p}**${ctx.locale('common:name')}:** ${ctx.locale(
                    `data:magic-items.${c.id as 1}.name`,
                  )}\n**${ctx.locale('common:description')}**: ${ctx.locale(
                    `data:magic-items.${c.id as 1}.description`,
                  )}\n\n`,
                '',
              )
            : ctx.locale('commands:itens.no-item-active'),
        inline: true,
      },
    ],
  });

  ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow([availableItems])],
  });
};

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
  authorDataFields: ['selectedColor', 'inUseItems', 'inventory', 'id'],
  commandRelatedExecutions: [buttonClickExecutor, selectedToUseExecutor],
  execute: async (ctx, finishCommand) => {
    const inputUser = ctx.getOption<User>('user', 'users', false) ?? ctx.author;
    const user =
      inputUser.id !== ctx.author.id ? await userRepository.findUser(inputUser.id) : ctx.authorData;

    if (!user)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:itens.no-user'),
          flags: MessageFlags.Ephemeral,
        }),
      );

    if (user.ban)
      return finishCommand(
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:itens.banned'),
          flags: MessageFlags.Ephemeral,
        }),
      );

    const embed = createEmbed({
      title: ctx.locale('commands:itens.title', { user: inputUser.username }),
      color: hexStringToNumber(user.selectedColor),
      fields: [],
    });

    if (user.inventory.length === 0) {
      embed.description = ctx.prettyResponse('error', 'commands:itens.no-item');
      ctx.makeMessage({ embeds: [embed] });
      finishCommand();
      return;
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
          : ctx.locale('commands:itens.no-item-active'),
      inline: true,
    });

    if (inputUser.id !== ctx.author.id) return finishCommand(ctx.makeMessage({ embeds: [embed] }));

    const useItemButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.originalInteractionId, 'USE'),
      label: ctx.locale('commands:itens.use'),
      style: ButtonStyles.Primary,
    });

    const resetItemsButton = createButton({
      customId: createCustomId(0, ctx.author.id, ctx.originalInteractionId, 'RESET'),
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

    finishCommand();
  },
});

export default ItemsCommand;
