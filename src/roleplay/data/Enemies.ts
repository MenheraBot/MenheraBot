import { EnemiesFile } from '@roleplay/Types';

const Enemies: { [id: number]: EnemiesFile } = {
  1: {
    dungeonLevels: [1],
    baseDamage: 15,
    baseLife: 50,
    experience: 10,
    baseArmor: 10,
    baseAgility: 7,
    statsPerPhase: {
      baseAgility: 11,
      baseDamage: 13,
      baseLife: 10,
      baseArmor: 8,
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
    baseDamage: 13,
    baseLife: 60,
    experience: 10,
    baseArmor: 11,
    baseAgility: 8,
    statsPerPhase: {
      baseDamage: 20,
      baseLife: 40,
      baseAgility: 10,
      baseArmor: 8,
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
    dungeonLevels: [1],
    baseDamage: 13,
    baseLife: 60,
    experience: 10,
    baseAgility: 7,
    baseArmor: 9,
    statsPerPhase: {
      baseDamage: 10,
      baseLife: 20,
      baseAgility: 12,
      baseArmor: 8,
      experience: 3,
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
    baseAgility: 13,
    statsPerPhase: {
      baseDamage: 40,
      baseAgility: 15,
      baseLife: 100,
      baseArmor: 10,
      experience: 20,
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
    baseAgility: 26,
    baseArmor: 10,
    statsPerPhase: {
      baseDamage: 20,
      baseLife: 130,
      baseAgility: 13,
      baseArmor: 15,
      experience: 22,
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
    baseAgility: 30,
    statsPerPhase: {
      baseDamage: 46,
      baseLife: 80,
      baseAgility: 14,
      baseArmor: 16,
      experience: 40,
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
    baseDamage: 60,
    baseLife: 800,
    experience: 60,
    baseAgility: 34,
    baseArmor: 40,
    statsPerPhase: {
      baseDamage: 13,
      baseLife: 30,
      baseArmor: 6,
      experience: 20,
      baseAgility: 11,
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
    baseAgility: 46,
    baseArmor: 50,
    statsPerPhase: {
      baseDamage: 30,
      baseLife: 40,
      baseAgility: 18,
      baseArmor: 10,
      experience: 30,
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
    baseLife: 250,
    experience: 40,
    baseAgility: 19,
    baseArmor: 16,
    statsPerPhase: {
      baseDamage: 12,
      baseLife: 30,
      baseAgility: 8,
      baseArmor: 6,
      experience: 14,
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
    baseAgility: 21,
    baseArmor: 30,
    statsPerPhase: {
      baseDamage: 16,
      baseLife: 40,
      baseAgility: 9,
      baseArmor: 7,
      experience: 23,
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
