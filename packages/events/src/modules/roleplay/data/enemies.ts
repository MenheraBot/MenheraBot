import { InventoryItem } from '../types';

export const Enemies = {
  1: {
    life: 80,
    damage: 12,
    drops: [{ id: 1, amount: 1 }],
  },
  2: {
    life: 70,
    damage: 15,
    drops: [
      { id: 2, amount: 1 },
      { id: 2, amount: 2 },
    ],
  },
  3: {
    life: 100,
    damage: 16,
    drops: [
      { id: 1, amount: 2 },
      { id: 1, amount: 1 },
    ],
  },
  4: {
    life: 70,
    damage: 19,
    drops: [{ id: 3, amount: 1 }],
  },
  5: {
    life: 65,
    damage: 24,
    drops: [{ id: 2, amount: 1 }],
  },
  6: {
    life: 75,
    damage: 20,
    drops: [
      { id: 4, amount: 1 },
      { id: 2, amount: 1 },
    ],
  },
};

export type EnemyID = keyof typeof Enemies;

export interface Enemy {
  life: number;
  damage: number;
  drops: InventoryItem[];
  id: EnemyID;
}

export const getEnemy = (enemyId: number | string): Enemy =>
  ({
    ...Enemies[enemyId as '1'],
    id: Number(enemyId) as 1,
  } as Enemy);
