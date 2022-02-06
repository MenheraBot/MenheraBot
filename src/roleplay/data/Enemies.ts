import { EnemiesFile } from '@roleplay/Types';

const Enemies: { [id: number]: EnemiesFile } = {
  1: {
    dungeonLevels: [1],
    baseDamage: 12,
    baseLife: 50,
    experience: 10,
    baseArmor: 10,
    perLevel: {
      baseDamage: 4,
      baseLife: 6,
      baseArmor: 2,
      experience: 2,
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
    baseDamage: 16,
    baseLife: 60,
    experience: 16,
    baseArmor: 11,
    perLevel: {
      baseDamage: 5,
      baseLife: 9,
      baseArmor: 3,
      experience: 6,
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
    dungeonLevels: [1],
    baseDamage: 6,
    baseLife: 60,
    experience: 40,
    baseArmor: 9,
    perLevel: {
      baseDamage: 4,
      baseLife: 7,
      baseArmor: 3,
      experience: 6,
    },
    loots: [
      {
        probability: 95,
        loots: [
          { id: 2, level: 1 },
          { id: 3, level: 1 },
        ],
      },
      {
        probability: 5,
        loots: [
          { id: 1, level: 1 },
          { id: 2, level: 1 },
        ],
      },
    ],
  },
  4: {
    dungeonLevels: [3],
    baseDamage: 30,
    baseLife: 250,
    experience: 50,
    baseArmor: 10,
    perLevel: {
      baseDamage: 4,
      baseLife: 30,
      baseArmor: 6,
      experience: 6,
    },
    loots: [
      {
        probability: 50,
        loots: [
          { id: 5, level: 1 },
          { id: 2, level: 1 },
        ],
      },
      {
        probability: 45,
        loots: [
          { id: 3, level: 1 },
          { id: 2, level: 1 },
          { id: 1, level: 1 },
        ],
      },
      {
        probability: 5,
        loots: [
          { id: 4, level: 1 },
          { id: 1, level: 1 },
          { id: 1, level: 1 },
        ],
      },
    ],
  },
  5: {
    dungeonLevels: [3, 4],
    baseDamage: 40,
    baseLife: 340,
    experience: 52,
    baseArmor: 10,
    perLevel: {
      baseDamage: 6,
      baseLife: 30,
      baseArmor: 10,
      experience: 7,
    },
    loots: [
      {
        probability: 50,
        loots: [
          { id: 4, level: 1 },
          { id: 3, level: 1 },
        ],
      },
      {
        probability: 45,
        loots: [
          { id: 3, level: 1 },
          { id: 4, level: 1 },
          { id: 4, level: 1 },
        ],
      },
      {
        probability: 5,
        loots: [
          { id: 5, level: 1 },
          { id: 5, level: 1 },
          { id: 2, level: 1 },
        ],
      },
    ],
  },
  6: {
    dungeonLevels: [4],
    baseDamage: 40,
    baseLife: 300,
    experience: 100,
    baseArmor: 30,
    perLevel: {
      baseDamage: 3,
      baseLife: 4,
      baseArmor: 1,
      experience: 4,
    },
    loots: [
      {
        probability: 99,
        loots: [
          { id: 4, level: 1 },
          { id: 5, level: 1 },
        ],
      },
      {
        probability: 1,
        loots: [
          { id: 5, level: 1 },
          { id: 5, level: 1 },
          { id: 5, level: 1 },
        ],
      },
    ],
  },
  7: {
    dungeonLevels: [4, 5],
    baseDamage: 70,
    baseLife: 800,
    experience: 60,
    baseArmor: 40,
    perLevel: {
      baseDamage: 2,
      baseLife: 30,
      baseArmor: 6,
      experience: 10,
    },
    loots: [
      {
        probability: 50,
        loots: [
          { id: 2, level: 1 },
          { id: 4, level: 1 },
        ],
      },
      {
        probability: 48,
        loots: [
          { id: 5, level: 1 },
          { id: 3, level: 1 },
          { id: 1, level: 2 },
        ],
      },
      {
        probability: 2,
        loots: [
          { id: 2, level: 2 },
          { id: 5, level: 1 },
          { id: 1, level: 2 },
        ],
      },
    ],
  },
  8: {
    dungeonLevels: [5],
    baseDamage: 80,
    baseLife: 600,
    experience: 10,
    baseArmor: 50,
    perLevel: {
      baseDamage: 20,
      baseLife: 12,
      baseArmor: 13,
      experience: 11,
    },
    loots: [
      {
        probability: 100,
        loots: [
          { id: 6, level: 1 },
          { id: 3, level: 2 },
        ],
      },
      {
        probability: 99,
        loots: [
          { id: 6, level: 1 },
          { id: 6, level: 1 },
          { id: 4, level: 2 },
        ],
      },
      {
        probability: 1,
        loots: [
          { id: 1, level: 1 },
          { id: 1, level: 1 },
          { id: 1, level: 1 },
        ],
      },
    ],
  },
  9: {
    dungeonLevels: [2],
    baseDamage: 30,
    baseLife: 300,
    experience: 40,
    baseArmor: 40,
    perLevel: {
      baseDamage: 13,
      baseLife: 10,
      baseArmor: 5,
      experience: 3,
    },
    loots: [
      {
        probability: 80,
        loots: [
          { id: 2, level: 1 },
          { id: 4, level: 1 },
        ],
      },
      {
        probability: 20,
        loots: [
          { id: 1, level: 1 },
          { id: 1, level: 1 },
          { id: 2, level: 1 },
        ],
      },
    ],
  },
  10: {
    dungeonLevels: [3],
    baseDamage: 40,
    baseLife: 430,
    experience: 52,
    baseArmor: 30,
    perLevel: {
      baseDamage: 10,
      baseLife: 10,
      baseArmor: 7,
      experience: 8,
    },
    loots: [
      {
        probability: 50,
        loots: [
          { id: 4, level: 1 },
          { id: 3, level: 2 },
        ],
      },
      {
        probability: 45,
        loots: [
          { id: 3, level: 1 },
          { id: 4, level: 1 },
          { id: 4, level: 1 },
        ],
      },
      {
        probability: 5,
        loots: [
          { id: 5, level: 1 },
          { id: 5, level: 1 },
          { id: 2, level: 2 },
        ],
      },
    ],
  },
};

export default Enemies;
