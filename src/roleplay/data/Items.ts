import { ItemsFile } from '@roleplay/Types';

const Items: { [id: number]: ItemsFile } = {
  100: {
    type: 'backpack',
    capacity: 5,
    perLevel: 5,
    flags: [],
  },
  1: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 2,
    flags: ['droppable', 'sellable'],
  },
  2: {
    type: 'enemy_drop',
    marketValue: 1,
    perLevel: 3,
    flags: ['droppable', 'sellable'],
  },
  3: {
    type: 'enemy_drop',
    marketValue: 2,
    perLevel: 4,
    flags: ['droppable', 'sellable'],
  },
  4: {
    type: 'enemy_drop',
    marketValue: 7,
    perLevel: 3,
    flags: ['droppable', 'sellable'],
  },
  5: {
    type: 'enemy_drop',
    marketValue: 10,
    perLevel: 10,
    flags: ['droppable', 'sellable'],
  },
  6: {
    type: 'enemy_drop',
    marketValue: 12,
    perLevel: 7,
    flags: ['droppable', 'sellable'],
  },
  7: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 40,
    boostType: 'life',
    perLevel: 20,
    flags: ['buyable', 'consumable'],
  },
  8: {
    type: 'potion',
    marketValue: 15,
    baseBoost: 30,
    boostType: 'mana',
    perLevel: 20,
    flags: ['buyable', 'consumable'],
  },
};

export default Items;
