import { Ability } from '../types';

export const Abilities = {
  0: {
    energyCost: 1,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 15 }],
  },
  1: {
    energyCost: 3,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 38 }],
  },
  2: {
    energyCost: 5,
    effects: [{ applyTo: 'enemy', type: 'damage', value: 46 }],
  },
  3: {
    energyCost: 5,
    effects: [{ applyTo: 'player', type: 'heal', value: 23, timesToApply: 2 }],
  },
  4: {
    energyCost: 3,
    effects: [{ applyTo: 'enemy', type: 'poison', value: 7, timesToApply: 4 }],
  },
};

export type AbilityID = keyof typeof Abilities;

export const getAbility = (abilityId: number): Ability => Abilities[abilityId as 1] as Ability;
