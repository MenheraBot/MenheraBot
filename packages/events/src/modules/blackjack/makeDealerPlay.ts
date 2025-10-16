import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types.js';
import { BLACKJACK_PRIZE_MULTIPLIERS } from './index.js';
import { getHandValue, numbersToBlackjackCards } from './blackjackMatch.js';
import { finishMatch } from './finishMatch.js';

const makeDealerPlay = async (
  ctx: ComponentInteractionContext,
  bet: number,
  playerCards: number[],
  dealerCards: number[],
  matchCards: number[],
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  cardBackgroundTheme: AvailableCardBackgroundThemes,
  embedColor: string,
  secondCopy: boolean,
): Promise<void> => {
  const bjPlayerCards = numbersToBlackjackCards(playerCards);
  const playerHandValue = getHandValue(bjPlayerCards);

  const bjDealerCards = numbersToBlackjackCards(dealerCards);
  let dealerHandValue = getHandValue(bjDealerCards);

  while (dealerHandValue < 17) {
    const newCard = numbersToBlackjackCards(matchCards.splice(0, 1));
    bjDealerCards.push(...newCard);
    dealerHandValue = getHandValue(bjDealerCards);
  }

  if (dealerHandValue === 21)
    return finishMatch(
      ctx,
      bet,
      bjPlayerCards,
      bjDealerCards,
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      cardBackgroundTheme,
      'blackjack',
      false,
      BLACKJACK_PRIZE_MULTIPLIERS.blackjack,
      embedColor,
      secondCopy,
    );

  if (dealerHandValue > 21)
    return finishMatch(
      ctx,
      bet,
      bjPlayerCards,
      bjDealerCards,
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      cardBackgroundTheme,
      'busted',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      embedColor,
      secondCopy,
    );

  if (dealerHandValue === playerHandValue)
    return finishMatch(
      ctx,
      bet,
      bjPlayerCards,
      bjDealerCards,
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      cardBackgroundTheme,
      'draw',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.draw,
      embedColor,
      secondCopy,
    );

  if (dealerHandValue > playerHandValue)
    return finishMatch(
      ctx,
      bet,
      bjPlayerCards,
      bjDealerCards,
      playerHandValue,
      dealerHandValue,
      cardTheme,
      tableTheme,
      cardBackgroundTheme,
      'biggest',
      false,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      embedColor,
      secondCopy,
    );

  return finishMatch(
    ctx,
    bet,
    bjPlayerCards,
    bjDealerCards,
    playerHandValue,
    dealerHandValue,
    cardTheme,
    tableTheme,
    cardBackgroundTheme,
    'biggest',
    true,
    BLACKJACK_PRIZE_MULTIPLIERS.base,
    embedColor,
    secondCopy,
  );
};

export { makeDealerPlay };
