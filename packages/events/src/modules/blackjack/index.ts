import { TaxedGameLimts } from '../../utils/taxesUtils';

const BLACKJACK_CARDS = Array.from({ length: 52 }, (_, i) => i + 1);

const BLACKJACK_PRIZE_MULTIPLIERS = {
  init_blackjack: 2.5,
  blackjack: 2,
  base: 2,
  draw: 1,
};

const BLACKJACK_TAXES = {
  MAX_LIMIT: 50_000,
  MAX_TAX: 25 / 100,
  MIN_LIMIT: 10,
  MIN_TAX: 3.8 / 100,
} satisfies TaxedGameLimts;

const shuffleCards = (): number[] => {
  const array = [...BLACKJACK_CARDS];

  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

export { BLACKJACK_CARDS, BLACKJACK_PRIZE_MULTIPLIERS, BLACKJACK_TAXES, shuffleCards };
