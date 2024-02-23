import { InventoryItem } from '../types';

export const Enemies = {
  1: {
    life: [90, 160, 250, 310, 400],
    damage: [1, 2, 3, 4, 5],
    drops: [
      [
        { id: 1, amount: 1 },
        { id: 1, amount: 1 },
      ],
      [
        { id: 1, amount: 1 },
        { id: 1, amount: 1 },
      ],
      [
        { id: 1, amount: 1 },
        { id: 1, amount: 1 },
      ],
      [
        { id: 1, amount: 1 },
        { id: 1, amount: 1 },
      ],
      [
        { id: 1, amount: 1 },
        { id: 1, amount: 1 },
      ],
    ],
  },
};

export type EnemyID = keyof typeof Enemies;

export interface Enemy {
  life: number[];
  damage: number[];
  drops: InventoryItem[][];
  id: EnemyID;
}

export const getEnemy = (enemyId: number | string): Enemy =>
  ({
    ...Enemies[enemyId as '1'],
    id: Number(enemyId) as 1,
  } as Enemy);
