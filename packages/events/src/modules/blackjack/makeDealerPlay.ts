import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';
import { BLACKJACK_PRIZE_MULTIPLIERS } from './index';
import { getHandValue, numbersToBlackjackCards } from './blackjackMatch';
import { finishMatch } from './finishMatch';

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

  const finishCommand = () => undefined;

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
      finishCommand,
      embedColor,
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
      finishCommand,
      embedColor,
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
      false,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      finishCommand,
      embedColor,
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
      finishCommand,
      embedColor,
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
      cardBackgroundTheme,
      'biggest',
      true,
      BLACKJACK_PRIZE_MULTIPLIERS.base,
      finishCommand,
      embedColor,
    );
};

export { makeDealerPlay };
