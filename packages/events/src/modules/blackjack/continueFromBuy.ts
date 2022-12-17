import { ButtonStyles } from 'discordeno/types';
import blackjackRepository from '../../database/repositories/blackjackRepository';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import {
  generateBlackjackEmbed,
  getHandValue,
  getTableImage,
  hideMenheraCard,
  numbersToBlackjackCards,
  safeImageReply,
} from './blackjackMatch';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';

const continueFromBuy = async (
  ctx: ChatInputInteractionContext | ComponentInteractionContext,
  bet: number,
  oldPLayerCards: number[],
  dealerCards: number[],
  matchCards: number[],
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  cardBackgroundTheme: AvailableCardBackgroundThemes,
  embedColor: string,
): Promise<void> => {
  const newCard = matchCards.shift() as number;
  const playerCards = [...oldPLayerCards, newCard];

  const bjPlayerCards = numbersToBlackjackCards(playerCards);
  const bjDealerCards = numbersToBlackjackCards(dealerCards);
  const playerHandValue = getHandValue(bjPlayerCards);
  const dealerHandValue = getHandValue([bjDealerCards[0]]);

  const image = await getTableImage(
    ctx,
    bet,
    bjPlayerCards,
    hideMenheraCard(bjDealerCards),
    playerHandValue,
    dealerHandValue,
    cardTheme,
    tableTheme,
    cardBackgroundTheme,
  );

  const embed = generateBlackjackEmbed(
    ctx,
    bjPlayerCards,
    hideMenheraCard(bjDealerCards),
    playerHandValue,
    dealerHandValue,
    embedColor,
  );

  const buyButton = createButton({
    customId: createCustomId(0, ctx.interaction.user.id, ctx.commandId, 'BUY', bet, embedColor),
    style: ButtonStyles.Primary,
    label: ctx.locale('commands:blackjack.buy'),
  });

  const stopButton = createButton({
    customId: createCustomId(0, ctx.interaction.user.id, ctx.commandId, 'STOP', bet, embedColor),
    style: ButtonStyles.Danger,
    label: ctx.locale('commands:blackjack.stop'),
  });

  await safeImageReply(ctx, embed, image, [createActionRow([buyButton, stopButton])]);

  await blackjackRepository.updateBlackjackState(ctx.interaction.user.id, ctx.commandId, {
    bet,
    cardBackgroundTheme,
    cardTheme,
    tableTheme,
    dealerCards,
    matchCards,
    playerCards,
  });
};

export { continueFromBuy };
