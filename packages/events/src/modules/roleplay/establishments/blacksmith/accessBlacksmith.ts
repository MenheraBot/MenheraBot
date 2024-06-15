import { ActionRow, ButtonComponent, ButtonStyles } from 'discordeno/types';
import { Embed } from 'discordeno';
import { createEmbed, hexStringToNumber } from '../../../../utils/discord/embedUtils';
import { DropItem, getItem } from '../../data/items';
import { InteractionContext } from '../../../../types/menhera';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
} from '../../../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../../../structures/command/ComponentInteractionContext';
import { DatabaseCharacterSchema } from '../../../../types/database';
import { ModalInteraction, SelectMenuInteraction } from '../../../../types/interaction';
import { displaySellItemsModal, executeSellItem } from './sellItems';
import battleRepository from '../../../../database/repositories/battleRepository';
import { MessageFlags } from '../../../../utils/discord/messageUtils';
import roleplayRepository from '../../../../database/repositories/roleplayRepository';

const availableLocales = ['sell', 'buy'] as const;

type Pages = (typeof availableLocales)[number];

const getPaginationInfo = (
  ctx: InteractionContext,
  character: DatabaseCharacterSchema,
  currentPage: Pages,
  selectedColor: string,
): [Embed, ActionRow[]] => {
  const embed = createEmbed({
    title: ctx.prettyResponse('hammer', 'commands:acessar.blacksmith.title'),
    color: hexStringToNumber(selectedColor),
    description: '',
  });

  const components: ActionRow[] = [];

  switch (currentPage) {
    case 'sell': {
      const selectMenu = createSelectMenu({
        customId: createCustomId(
          0,
          ctx.user.id,
          ctx.originalInteractionId,
          'SELL_ITEM',
          selectedColor,
        ),
        options: [],
        minValues: 1,
        maxValues: 5,
      });

      character.inventory.forEach((i) => {
        const item = getItem<DropItem>(i.id);

        embed.description += `- **${i.amount}x${
          item.sellMinAmount ? ` / ${item.sellMinAmount}x` : ''
        }** - ${ctx.locale('commands:acessar.blacksmith.sell.item-description', {
          name: ctx.locale(`items:${i.id}.name`),
          amount: i.amount,
          value: item.sellValue,
        })}\n`;

        if (item.sellMinAmount && item.sellMinAmount > i.amount) return;

        selectMenu.options.push({
          label: ctx.locale('commands:acessar.blacksmith.sell.sell', {
            name: ctx.locale(`items:${i.id}.name`),
          }),
          value: `${i.id}`,
        });
      });

      if (selectMenu.options.length < 5) selectMenu.maxValues = selectMenu.options.length;

      const isValidSelectMenu = selectMenu.options.length >= 1;

      if (isValidSelectMenu) components.push(createActionRow([selectMenu]));

      embed.description += `\n\n${ctx.locale(
        `commands:acessar.blacksmith.sell.${isValidSelectMenu ? 'select' : 'no-items'}`,
      )}`;

      break;
    }
    case 'buy':
      embed.description = 'HAHAHA';
      break;
  }

  components.push(
    createActionRow(
      availableLocales.map((a) =>
        createButton({
          label: ctx.locale(`commands:acessar.blacksmith.pagination.${a}`),
          style: ButtonStyles.Primary,
          disabled: a === 'buy' || a === currentPage,
          customId: createCustomId(
            0,
            ctx.user.id,
            ctx.originalInteractionId,
            'PAGE',
            a,
            selectedColor,
          ),
        }),
      ) as [ButtonComponent],
    ),
  );

  return [embed, components];
};

const executeNavigation = async (
  ctx: InteractionContext,
  currentPage: Pages,
  selectedColor: string,
): Promise<void> => {
  const isUserInBattle = await battleRepository.isUserInBattle(ctx.user.id);

  if (isUserInBattle)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:acessar.blacksmith.in-battle'),
      components: [],
      embeds: [],
      flags: MessageFlags.EPHEMERAL,
    });

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  const [embed, components] = getPaginationInfo(ctx, character, currentPage, selectedColor);

  await ctx.makeMessage({
    embeds: [embed],
    components,
  });
};

const handleInteraction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [action, page, selectedColor] = ctx.sentData;

  if (action === 'PAGE') return executeNavigation(ctx, page as 'sell', selectedColor);

  if (action === 'SELL_ITEM')
    return displaySellItemsModal(ctx as ComponentInteractionContext<SelectMenuInteraction>);

  if (action === 'SELL_MODAL')
    return executeSellItem(ctx as ComponentInteractionContext<ModalInteraction>);
};

export { handleInteraction, executeNavigation };
