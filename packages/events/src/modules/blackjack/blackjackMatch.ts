import { BlackjackCard } from './types';

const numbersToBlackjackCards = (cards: Array<number>): Array<BlackjackCard> =>
  cards.reduce((p: Array<BlackjackCard>, c: number) => {
    const multiplier = Math.ceil(c / 13) - 1;
    const newC = c - multiplier * 13;

    p.push({
      value: newC > 10 ? 10 : newC,
      isAce: newC === 1,
      id: c,
    });

    return p;
  }, []);

const getHandValue = (cards: BlackjackCard[]): number => {
  let total = cards.reduce((p, a) => a.value + p, 0);

  if (cards.some((a) => a.isAce) && total <= 11)
    total = cards.reduce((p, a) => (a.isAce && p <= 10 ? 11 : a.value) + p, 0);

  return total;
};

export { numbersToBlackjackCards, getHandValue };
