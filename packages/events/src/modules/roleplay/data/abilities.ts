import { Ability } from '../types';

export const Abilities: Record<number, Ability> = {
  0: {
    $devName: 'Ataque básico',
    energyCost: 1,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 15 }],
  },
  1: {
    $devName: 'Ataque rápido',
    energyCost: 3,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 38 }],
  },
  2: {
    $devName: 'Sopro flamejante',
    energyCost: 4,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 46 }],
  },
  3: {
    $devName: 'Ervas medicinais',
    energyCost: 7,
    effects: [{ applyTo: 'player', type: 'heal', value: 23, timesToApply: 2 }],
  },
  4: {
    $devName: 'Envenenamento',
    energyCost: 5,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 20, timesToApply: 4 }],
  },
};

export const getAbility = (abilityId: number): Ability => Abilities[abilityId];
