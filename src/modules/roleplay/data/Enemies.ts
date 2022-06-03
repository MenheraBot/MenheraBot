import { EnemiesFile } from '@roleplay/Types';

const Enemies: { [id: number]: EnemiesFile } = {
  1: {
    dungeonLevels: [1],
    baseDamage: 15,
    baseLife: 70,
    experience: 25,
    baseArmor: 31,
    baseAgility: 7,
    statsPerPhase: {
      baseAgility: 11,
      baseDamage: 13,
      baseLife: 10,
      baseArmor: 8,
      experience: 19,
    },
    loots: [
      {
        probability: 50,
        loots: [1, 2],
      },
      {
        probability: 40,
        loots: [1, 1],
      },
      {
        probability: 10,
        loots: [2, 2],
      },
    ],
  },
  2: {
    dungeonLevels: [1, 2],
    baseDamage: 13,
    baseLife: 90,
    experience: 26,
    baseArmor: 26,
    baseAgility: 8,
    statsPerPhase: {
      baseDamage: 20,
      baseLife: 40,
      baseAgility: 10,
      baseArmor: 8,
      experience: 21,
    },
    loots: [
      {
        probability: 40,
        loots: [1, 2],
      },
      {
        probability: 40,
        loots: [1, 3],
      },
      {
        probability: 20,
        loots: [2, 3],
      },
    ],
  },
  3: {
    dungeonLevels: [1],
    baseDamage: 13,
    baseLife: 80,
    experience: 24,
    baseAgility: 7,
    baseArmor: 31,
    statsPerPhase: {
      baseDamage: 10,
      baseLife: 20,
      baseAgility: 12,
      baseArmor: 8,
      experience: 12,
    },
    loots: [
      {
        probability: 95,
        loots: [2, 3],
      },
      {
        probability: 5,
        loots: [1, 2],
      },
    ],
  },
  4: {
    dungeonLevels: [3],
    baseDamage: 30,
    baseLife: 250,
    experience: 61,
    baseArmor: 10,
    baseAgility: 13,
    statsPerPhase: {
      baseDamage: 40,
      baseAgility: 15,
      baseLife: 100,
      baseArmor: 10,
      experience: 34,
    },
    loots: [
      {
        probability: 50,
        loots: [5, 2],
      },
      {
        probability: 45,
        loots: [1, 2, 3],
      },
      {
        probability: 5,
        loots: [4, 1, 1],
      },
    ],
  },
  5: {
    dungeonLevels: [3, 4],
    baseDamage: 40,
    baseLife: 340,
    experience: 61,
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
        loots: [4, 3],
      },
      {
        probability: 45,
        loots: [3, 4, 4],
      },
      {
        probability: 5,
        loots: [5, 5, 2],
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
        loots: [4, 5],
      },
      {
        probability: 1,
        loots: [5, 5, 5],
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
        loots: [2, 4],
      },
      {
        probability: 48,
        loots: [5, 3, 1],
      },
      {
        probability: 2,
        loots: [2, 5, 1],
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
        loots: [6, 3],
      },
      {
        probability: 99,
        loots: [6, 6, 4],
      },
      {
        probability: 1,
        loots: [1, 1, 1],
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
        loots: [2, 4],
      },
      {
        probability: 20,
        loots: [1, 1, 2],
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
        loots: [4, 3],
      },
      {
        probability: 45,
        loots: [3, 4, 4],
      },
      {
        probability: 5,
        loots: [5, 5, 2],
      },
    ],
  },
};

export default Enemies;
