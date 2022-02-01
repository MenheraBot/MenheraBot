import { EnemiesFile } from '@roleplay/Types';

const Enemies: { [id: number]: EnemiesFile } = {
  1: {
    dungeonLevels: [1],
    baseDamage: 23,
    baseLife: 100,
    experience: 10,
    baseArmor: 4,
    perLevel: {
      baseDamage: 7,
      baseLife: 12,
      baseArmor: 3,
      experience: 10,
    },
    loots: [
      {
        probability: 50,
        loots: [
          { id: 1, level: 1 },
          { id: 2, level: 1 },
        ],
      },
      {
        probability: 40,
        loots: [
          { id: 1, level: 1 },
          { id: 1, level: 1 },
        ],
      },
      {
        probability: 10,
        loots: [
          { id: 2, level: 1 },
          { id: 2, level: 1 },
        ],
      },
    ],
  },
  2: {
    dungeonLevels: [1, 2],
    baseDamage: 25,
    baseLife: 110,
    experience: 16,
    baseArmor: 5,
    perLevel: {
      baseDamage: 8,
      baseLife: 13,
      baseArmor: 4,
      experience: 15,
    },
    loots: [
      {
        probability: 40,
        loots: [
          { id: 1, level: 1 },
          { id: 2, level: 1 },
        ],
      },
      {
        probability: 40,
        loots: [
          { id: 1, level: 1 },
          { id: 3, level: 1 },
        ],
      },
      {
        probability: 20,
        loots: [
          { id: 2, level: 1 },
          { id: 3, level: 1 },
        ],
      },
    ],
  },
  3: {
    dungeonLevels: [3, 4, 5, 6, 7, 8, 9, 10],
    baseDamage: 50,
    baseLife: 150,
    experience: 300,
    baseArmor: 10,
    perLevel: {
      baseDamage: 10,
      baseLife: 20,
      baseArmor: 2,
      experience: 100,
    },
    loots: [
      {
        probability: 95,
        loots: [
          { id: 4, level: 1 },
          { id: 3, level: 1 },
        ],
      },
      {
        probability: 5,
        loots: [
          { id: 4, level: 1 },
          { id: 4, level: 1 },
        ],
      },
    ],
  },
};

export default Enemies;
