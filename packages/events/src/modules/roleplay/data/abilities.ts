import { UserAbility } from '../types';

export const Abilities: Record<number, Omit<UserAbility, 'id'> & { $devName: string }> = {
  1: {
    $devName: 'Tiro de água',
    damage: 30,
    energyCost: 3,
  },
  2: {
    $devName: 'Flecha de fogo',
    damage: 38,
    energyCost: 4,
  },
};
