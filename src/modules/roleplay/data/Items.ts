import { ItemsFile } from '@roleplay/Types';

const Items: { [id: number]: ItemsFile } = {
  1: {
    type: 'enemy_drop',
    marketValue: 1,
  },
  2: {
    type: 'enemy_drop',
    marketValue: 1,
  },
  3: {
    type: 'enemy_drop',
    marketValue: 2,
  },
  4: {
    type: 'enemy_drop',
    marketValue: 6,
  },
  5: {
    type: 'enemy_drop',
    marketValue: 9,
  },
  6: {
    type: 'enemy_drop',
    marketValue: 11,
  },
  7: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 40,
    boostType: 'life',
    perLevel: 20,
  },
  8: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 30,
    boostType: 'mana',
    perLevel: 20,
  },
};

export default Items;
