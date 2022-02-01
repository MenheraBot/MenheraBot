import { ItemsFile } from '@roleplay/Types';

const Items: { [id: number]: ItemsFile } = {
  100: {
    type: 'backpack',
    capacity: 5,
    perLevel: 5,
  },
  1: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 2,
  },
  2: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 3,
  },
  3: {
    type: 'enemy_drop',
    marketValue: 2,
    perLevel: 4,
  },
  4: {
    type: 'enemy_drop',
    marketValue: 7,
    perLevel: 3,
  },
  5: {
    type: 'enemy_drop',
    marketValue: 10,
    perLevel: 10,
  },
  6: {
    type: 'enemy_drop',
    marketValue: 12,
    perLevel: 7,
  },
  7: {
    type: 'consumable',
    marketValue: 15,
    baseBoost: 40,
    boostType: 'life',
    perLevel: 20,
  },
  8: {
    type: 'consumable',
    marketValue: 15,
    baseBoost: 30,
    boostType: 'mana',
    perLevel: 20,
  },
};

export default Items;
