import { ButtonComponent, ButtonStyles } from 'discordeno/types';
import { Embed } from 'discordeno';
import { createEmbed, hexStringToNumber } from '../../../utils/discord/embedUtils';
import roleplayRepository from '../../../database/repositories/roleplayRepository';
import { getItem } from '../data/items';
import { InteractionContext } from '../../../types/menhera';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../../utils/discord/componentUtils';
import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';
import battleRepository from '../../../database/repositories/battleRepository';
import { MessageFlags } from '../../../utils/discord/messageUtils';
import { DatabaseCharacterSchema } from '../../../types/database';

const availableLocales = ['SELL', 'BUY'] as const;

type Pages = (typeof availableLocales)[number];

const createBlacksmithEmbed = (
  character: DatabaseCharacterSchema,
  currentPage: Pages,
  selectedColor: string,
): Embed => {
  const embed = createEmbed({
    title: 'Ferreiro de Boleham',
    color: hexStringToNumber(selectedColor),
  });

  switch (currentPage) {
    case 'SELL':
      embed.description = character.inventory
        .map((a) => `-  **${a.amount}x** - ${getItem(a.id).$devName}`)
        .join('\n');

      break;
    case 'BUY':
      embed.footer = { text: 'HAHAHA' };
      break;
  }

  return embed;
};

const createBlacksmithNaviagtionButtons = (
  ctx: InteractionContext,
  currentPage: Pages,
  selectedColor: string,
): [ButtonComponent] =>
  availableLocales.map((a) =>
    createButton({
      label: a,
      style: ButtonStyles.Primary,
      disabled: a === currentPage,
      customId: createCustomId(0, ctx.user.id, ctx.commandId, a, selectedColor),
    }),
  ) as [ButtonComponent];

const getNaviationInfo = (
  ctx: InteractionContext,
  character: DatabaseCharacterSchema,
  currentPage: Pages,
  selectedColor: string,
): [Embed, [ButtonComponent]] => [
  createBlacksmithEmbed(character, currentPage, selectedColor),
  createBlacksmithNaviagtionButtons(ctx, currentPage, selectedColor),
];

const executeNavigation = async (
  ctx: InteractionContext,
  currentPage: Pages,
  selectedColor: string,
): Promise<void> => {
  const isUserInBattle = await battleRepository.isUserInBattle(ctx.user.id);

  if (isUserInBattle)
    return ctx.makeMessage({
      content: `Você está em uma Dungeon no momento. Não há ferreiros por perto.`,
      flags: MessageFlags.EPHEMERAL,
    });

  const character = await roleplayRepository.getCharacter(ctx.user.id);

  const [embed, buttons] = getNaviationInfo(ctx, character, currentPage, selectedColor);

  await ctx.makeMessage({
    embeds: [embed],
    components: [createActionRow(buttons)],
  });
};

const handleInteraction = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [page, selectedColor] = ctx.sentData;

  executeNavigation(ctx, page as 'SELL', selectedColor);
};

export { handleInteraction, executeNavigation };
