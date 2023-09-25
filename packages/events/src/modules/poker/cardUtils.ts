import { CARD_SUITE, PokerCard } from './types';

export const getCardSuit = (cardId: number): CARD_SUITE => {
  switch (Math.ceil(cardId / 13) - 1) {
    case 0:
      return 'SPADES';
    case 1:
      return 'HEARTS';
    case 2:
      return 'DIAMONDS';
    case 3:
      return 'CLUBS';
    default:
      return 'SPADES';
  }
};

const getCardDisplay = (cardValue: number): string => {
  switch (cardValue) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return `${cardValue}`;
  }
};

export const getPokerCard = (cardId: number): PokerCard => {
  const cardValue = cardId - (Math.ceil(cardId / 13) - 1) * 13;
  const cardSuit = getCardSuit(cardId);
  const cardDisplay = getCardDisplay(cardValue);

  const cardDisplayToPokerSolver = `${cardDisplay.replace('10', 'T')}${cardSuit[0].toLowerCase()}`;

  return {
    id: cardId,
    suit: cardSuit,
    value: cardValue,
    displayValue: cardDisplay,
    solverValue: cardDisplayToPokerSolver,
  };
};
