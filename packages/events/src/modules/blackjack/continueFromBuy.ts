import blackjackRepository from '../../database/repositories/blackjackRepository.js';
import { getHandValue, hideMenheraCard, numbersToBlackjackCards } from './blackjackMatch.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { sendBlackjackMessage } from './sendBlackjackMessage.js';

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
  secondCopy: boolean,
): Promise<void> => {
  const newCard = matchCards.shift() as number;
  const playerCards = [...oldPLayerCards, newCard];

  const bjPlayerCards = numbersToBlackjackCards(playerCards);
  const bjDealerCards = numbersToBlackjackCards(dealerCards);
  const playerHandValue = getHandValue(bjPlayerCards);
  const dealerHandValue = getHandValue([bjDealerCards[0]]);

  await blackjackRepository.updateBlackjackState(ctx.interaction.user.id, {
    bet,
    cardBackgroundTheme,
    cardTheme,
    tableTheme,
    dealerCards,
    matchCards,
    playerCards,
    secondCopy,
  });

  await sendBlackjackMessage(
    ctx,
    bet,
    bjPlayerCards,
    hideMenheraCard(bjDealerCards),
    playerHandValue,
    dealerHandValue,
    cardTheme,
    tableTheme,
    cardBackgroundTheme,
    embedColor,
    secondCopy,
  );
};

export { continueFromBuy };
