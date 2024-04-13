import blackjackRepository from '../../database/repositories/blackjackRepository';
import { getHandValue, hideMenheraCard, numbersToBlackjackCards } from './blackjackMatch';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import { sendBlackjackMessage } from './sendBlackjackMessage';
import { InteractionContext } from '../../types/menhera';

const continueFromBuy = async (
  ctx: InteractionContext,
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
