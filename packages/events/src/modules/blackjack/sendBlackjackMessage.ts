import { ButtonStyles, DiscordEmbedField } from 'discordeno/types';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import { generateBlackjackEmbed, getTableImage, safeImageReply } from './blackjackMatch';
import { BlackjackCard } from './types';

const sendBlackjackMessage = async (
  ctx: InteractionContext,
  bet: number,
  playerCards: BlackjackCard[],
  dealerCards: BlackjackCard[],
  playerHandValue: number,
  dealerHandValue: number,
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  cardBackgroundTheme: AvailableCardBackgroundThemes,
  embedColor: string,
  secondCopy: boolean,
  resultField?: DiscordEmbedField,
) => {
  const image = await getTableImage(
    ctx,
    bet,
    playerCards,
    dealerCards,
    playerHandValue,
    dealerHandValue,
    cardTheme,
    tableTheme,
    cardBackgroundTheme,
  );

  const embed = generateBlackjackEmbed(
    ctx,
    playerCards,
    dealerCards,
    playerHandValue,
    dealerHandValue,
    embedColor,
    secondCopy,
  );

  if (resultField) {
    if (!secondCopy) embed.footer = undefined;
    embed.fields?.push(resultField);
  }

  const buyButton = createButton({
    customId: createCustomId(0, ctx.interaction.user.id, ctx.commandId, 'BUY', embedColor),
    style: ButtonStyles.Primary,
    label: ctx.locale('commands:blackjack.buy'),
  });

  const stopButton = createButton({
    customId: createCustomId(0, ctx.interaction.user.id, ctx.commandId, 'STOP', embedColor),
    style: ButtonStyles.Danger,
    label: ctx.locale('commands:blackjack.stop'),
  });

  await safeImageReply(
    ctx,
    embed,
    image,
    resultField ? [] : [createActionRow([buyButton, stopButton])],
  );
};

export { sendBlackjackMessage };
