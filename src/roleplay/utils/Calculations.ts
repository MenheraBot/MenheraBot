import { ToBLess } from '@utils/Types';

export const getUserNextLevelXp = (level: number): number => level * 2000;

export const makeBlessingStatusUpgrade = (toBless: ToBLess, points: number): number => {
  switch (toBless) {
    case 'life':
      return points * 100;
    case 'mana':
      return points * 10;
    case 'intelligence':
      return points * 3;
    case 'armor':
      return points * 2;
    case 'damage':
      return points * 3;
  }
};
