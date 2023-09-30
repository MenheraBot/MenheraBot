import { shuffleCards } from '../blackjack';
import { CARD_SUITE, PokerCard, PokerMatch } from './types';

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

const SUIT_EMOJI = {
  SPADES: '♠️',
  HEARTS: '♥️',
  DIAMONDS: '♦️',
  CLUBS: '♣️',
};

const getPokerCard = (cardId: number): PokerCard => {
  const cardValue = cardId - (Math.ceil(cardId / 13) - 1) * 13;
  const cardSuit = getCardSuit(cardId);
  const cardDisplay = getCardDisplay(cardValue);

  const cardDisplayToPokerSolver = `${cardDisplay.replace('10', 'T')}${cardSuit[0].toLowerCase()}`;

  return {
    displayValue: `${cardDisplay} ${SUIT_EMOJI[cardSuit]}`,
    solverValue: cardDisplayToPokerSolver,
  };
};

const distributeCards = (gameData: PokerMatch): void => {
  const shuffledCards = shuffleCards();

  const getCards = <Cards extends 2 | 5>(
    cards: number[],
    length: Cards,
  ): Cards extends 2 ? [number, number] : [number, number, number, number, number] =>
    Array.from({ length }, () => cards.shift()) as Cards extends 2
      ? [number, number]
      : [number, number, number, number, number];

  for (let i = 0; i <= 1; i++) {
    gameData.players.forEach((player) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const card = shuffledCards.shift()!;
      player.cards[i] = card;
    });
  }

  gameData.communityCards = getCards(shuffledCards, 5);
};

const getOpenedCards = (gameData: PokerMatch): number[] => {
  switch (gameData.stage) {
    case 'preflop':
      return [];
    case 'flop':
      return [gameData.communityCards[0], gameData.communityCards[1], gameData.communityCards[2]];
    case 'turn':
      return [
        gameData.communityCards[0],
        gameData.communityCards[1],
        gameData.communityCards[2],
        gameData.communityCards[3],
      ];
    case 'river':
    case 'showdown':
      return [
        gameData.communityCards[0],
        gameData.communityCards[1],
        gameData.communityCards[2],
        gameData.communityCards[3],
        gameData.communityCards[4],
      ];
    default:
      return [];
  }
};

export { getPokerCard, distributeCards, getOpenedCards };
