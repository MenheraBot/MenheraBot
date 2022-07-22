import { BichoBetType, BichoGame, BichoWinner } from './bicho';

const BICHO_ANIMALS = [
  'avestruz',
  'ágia',
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
  thousand: 500,
  animal: 3,
  sequence: 19,
  corner: 1000,
};

const betType = (option: string): BichoBetType => {
  if (/^(?=.*\d)[\d ]+$/.test(option)) {
    const withoutBlank = option.replace(/\s/g, '');
    if (withoutBlank.length === 4) return 'thousand';
    if (withoutBlank.length === 3) return 'hundred';
    if (withoutBlank.length === 2) return 'ten';
    return 'unity';
  }

  const selectedAnimals = option.split(' | ');

  if (selectedAnimals.length === 5) return 'corner';
  if (selectedAnimals.length === 2) return 'sequence';
  return 'animal';
};

const didUserWin = (game: BichoGame, option: string, bet: BichoBetType): boolean => {
  switch (bet) {
    case 'unity':
      return game.results.some((a) => `${a[3]}` === option);
    case 'ten':
      return game.results.some((a) => `${a[2]}${a[3]}` === option);
    case 'hundred':
      return game.results.some((a) => `${a[1]}${a[2]}${a[3]}` === option);
    case 'thousand':
      return game.results.some((a) => `${a[0]}${a[1]}${a[2]}${a[3]}` === option);
    case 'animal': {
      const animals = game.results.map((a) => {
        const ten = Number(`${a[2]}${a[3]}`);
        return BICHO_ANIMALS[Math.floor(ten / 4)];
      });
      return animals.some((a) => a === option);
    }

    case 'corner': {
      const animals = game.results.map((a) => {
        const ten = Number(`${a[2]}${a[3]}`);
        return BICHO_ANIMALS[Math.floor(ten / 4)];
      });
      const userChoices = option.split(' | ');
      return animals.every((a) => userChoices.includes(a));
    }
    case 'sequence': {
      const animals = game.results.map(
        (a) => BICHO_ANIMALS[Math.floor(Number(`${a[2]}${a[3]}`) / 4)],
      );
      const user = option.split(' | ');
      const hasTwoAnimals = animals.every((a) => user.includes(a));
      if (!hasTwoAnimals) return false;

      const firstIndex = animals.indexOf(user[0]);
      const secondIndex = animals.indexOf(user[1]);

      return firstIndex < secondIndex;
    }
  }
};

const makePlayerResults = (game: BichoGame): BichoWinner[] => {
  return game.bets.map<BichoWinner>((player) => ({
    didWin: didUserWin(game, player.option, betType(player.option)),
    id: player.id,
    profit: player.bet * BICHO_BET_MULTIPLIER[betType(player.option)],
    bet: player.bet,
  }));
};

export { makePlayerResults };
