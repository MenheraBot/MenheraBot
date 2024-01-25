import { Ability } from '../types';

export const Abilities: Record<number, Ability> = {
  0: {
    $devName: 'Ataque Básico',
    energyCost: 1,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 14 }],
  },
  1: {
    $devName: 'Tiro de água',
    energyCost: 3,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 38 }],
  },
  2: {
    $devName: 'Flecha de fogo',
    energyCost: 4,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 46 }],
  },
  3: {
    $devName: 'Ervas Medicinais',
    energyCost: 5,
    effects: [{ applyTo: 'player', type: 'heal', value: 45 }],
  },
};

export const getAbility = (abilityId: number): Ability => Abilities[abilityId];
