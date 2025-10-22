import { ButtonStyles, DiscordEmbedField } from '@discordeno/bot';
import { InteractionContext } from '../../types/menhera.js';
import {
  createActionRow,
  createButton,
  createCustomId,
} from '../../utils/discord/componentUtils.js';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types.js';
import { generateBlackjackEmbed, getTableImage, safeImageReply } from './blackjackMatch.js';
import { BlackjackCard } from './types.js';

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
): Promise<void> => {
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
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'BUY',
      embedColor,
    ),
    style: ButtonStyles.Primary,
    label: ctx.locale('commands:blackjack.buy'),
  });

  const stopButton = createButton({
    customId: createCustomId(
      0,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'STOP',
      embedColor,
    ),
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
