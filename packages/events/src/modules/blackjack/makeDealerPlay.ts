import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import InteractionContext from '../../structures/command/InteractionContext';
import { BLACKJACK_PRIZE_MULTIPLIERS } from './index';
import { getHandValue, numbersToBlackjackCards } from './blackjackMatch';
import { finishMatch } from './finishMatch';

const makeDealerPlay = async (
  ctx: InteractionContext,
  bet: number,
  playerCards: number[],
  dealerCards: number[],
  matchCards: number[],
  cardTheme: AvailableCardThemes,
  tableTheme: AvailableTableThemes,
  backgroundCardTheme: AvailableCardBackgroundThemes,
  finishCommand: () => void,
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
      backgroundCardTheme,
      'blackjack',
      false,
      BLACKJACK_PRIZE_MULTIPLIERS.blackjack,
      finishCommand,
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
      backgroundCardTheme,
      'busted',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      finishCommand,
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
      backgroundCardTheme,
      'draw',
      false,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      finishCommand,
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
      backgroundCardTheme,
      'biggest',
      false,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      finishCommand,
    );

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
      backgroundCardTheme,
      'biggest',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      finishCommand,
    );
};

export { makeDealerPlay };
