import { resolveSeparatedStrings } from '../../utils/discord/componentUtils.js';
import { BetPlayer, BichoBetType, BichoWinner } from './types.js';

const BICHO_ANIMALS = [
  'avestruz',
  'águia',
  'burro',
  'borboleta',
  'cachorro',
  'cabra',
  'carneiro',
  'camelo',
  'cobra',
  'coelho',
  'cavalo',
  'elefante',
  'galo',
  'gato',
  'jacaré',
  'leão',
  'macaco',
  'porco',
  'pavão',
  'peru',
  'touro',
  'tigre',
  'urso',
  'veado',
  'vaca',
];

const BICHO_BET_MULTIPLIER = {
  unity: 2,
  ten: 5,
  hundred: 20,
  thousand: 40,
  animal: 3,
  sequence: 15,
  corner: 100,
};

const getBetType = (option: string): BichoBetType => {
  if (/^(?=.*\d)[\d ]+$/.test(option)) {
    const withoutBlank = option.replace(/\s/g, '');
    if (withoutBlank.length === 4) return 'thousand';
    if (withoutBlank.length === 3) return 'hundred';
    if (withoutBlank.length === 2) return 'ten';
    return 'unity';
  }

  const selectedAnimals = resolveSeparatedStrings(option);

  if (selectedAnimals.length === 5) return 'corner';
  if (selectedAnimals.length === 2) return 'sequence';
  return 'animal';
};

const mapResultToAnimal = (result: number[]): string =>
  BICHO_ANIMALS[Math.floor(Number(`${result[2]}${result[3]}`) / 4)];

const hasTwoAnimals = (animals: string[], user: string[]): boolean =>
  user.every((a) => animals.includes(a));

const hasSequence = (animals: string[], user: string[]): boolean => {
  const firstIndex = animals.indexOf(user[0]);
  const secondIndex = animals.indexOf(user[1]);
  return firstIndex < secondIndex;
};

const didUserWin = (results: number[][], option: string, bet: BichoBetType): boolean => {
  const animals = results.map(mapResultToAnimal);
  const userChoices = resolveSeparatedStrings(option);

  switch (bet) {
    case 'unity':
      return results.some((a) => `${a[3]}` === option);
    case 'ten':
      return results.some((a) => `${a[2]}${a[3]}` === option);
    case 'hundred':
      return results.some((a) => `${a[1]}${a[2]}${a[3]}` === option);
    case 'thousand':
      return results.some((a) => `${a[0]}${a[1]}${a[2]}${a[3]}` === option);
    case 'animal':
      return animals.some((a) => a === option);
    case 'corner':
      return animals.every((a) => userChoices.includes(a));
    case 'sequence':
      return (
        hasTwoAnimals(animals, resolveSeparatedStrings(option)) &&
        hasSequence(animals, resolveSeparatedStrings(option))
      );
  }
};

const makePlayerResults = (bets: BetPlayer[], gameResults: number[][]): BichoWinner[] => {
  return bets.map<BichoWinner>((player) => ({
    didWin: didUserWin(gameResults, player.option, getBetType(player.option)),
    id: `${player.id}`,
    option: player.option,
    profit: player.bet * BICHO_BET_MULTIPLIER[getBetType(player.option)],
    bet: player.bet,
  }));
};

export {
  makePlayerResults,
  BICHO_BET_MULTIPLIER,
  BICHO_ANIMALS,
  didUserWin,
  getBetType,
  mapResultToAnimal,
};
