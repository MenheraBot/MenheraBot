import { HolyBlessings } from './Types';

export const LAST_DUNGEON_LEVEL = 5;

export const BLESSES_DIFFERENCE_LIMIT = 15;

export const MOB_LIMIT_PER_DUNGEON_LEVEL = 3;

export const ROLEPLAY_COOLDOWNS = {
  dungeonCooldown: 3_600_000,
  deathCooldown: 14_400_000,
};

export const LEVEL_UP_EXPERIENCE: { [level: number]: number } = {
  1: 10,
  2: 100,
  3: 300,
  4: 700,
  5: 1300,
  6: 2200,
  7: 3900,
  8: 5600,
  9: 7500,
  10: 10_000,
  11: 19_000,
  12: 25_000,
  13: 40_000,
  14: 60_000,
  15: 100_000,
  16: 150_000,
  17: 200_000,
  18: 280_000,
  19: 360_000,
  20: 500_00,
  21: 1_000_000,
  22: Infinity,
};

export const LEVEL_UP_BLESSES: { [level: number]: HolyBlessings } = {
  1: {
    ability: 1,
    battle: 1,
    vitality: 5,
  },
  2: {
    ability: 1,
    battle: 2,
    vitality: 3,
  },
  3: {
    ability: 1,
    battle: 3,
    vitality: 2,
  },
  4: {
    ability: 5,
    battle: 3,
    vitality: 2,
  },
  5: {
    ability: 3,
    battle: 3,
    vitality: 4,
  },
  6: {
    ability: 2,
    battle: 4,
    vitality: 6,
  },
  7: {
    ability: 2,
    battle: 3,
    vitality: 5,
  },
  8: {
    ability: 3,
    battle: 4,
    vitality: 4,
  },
  9: {
    ability: 10,
    battle: 10,
    vitality: 10,
  },
  10: {
    ability: 3,
    battle: 4,
    vitality: 4,
  },
  11: {
    ability: 2,
    battle: 2,
    vitality: 3,
  },
  12: {
    ability: 3,
    battle: 3,
    vitality: 5,
  },
  13: {
    ability: 1,
    battle: 3,
    vitality: 4,
  },
  14: {
    ability: 15,
    battle: 8,
    vitality: 6,
  },
  15: {
    ability: 2,
    battle: 5,
    vitality: 10,
  },
  16: {
    ability: 6,
    battle: 3,
    vitality: 5,
  },
  17: {
    ability: 5,
    battle: 5,
    vitality: 5,
  },
  18: {
    ability: 3,
    battle: 8,
    vitality: 4,
  },
  19: {
    ability: 20,
    battle: 5,
    vitality: 5,
  },
  20: {
    ability: 3,
    battle: 3,
    vitality: 3,
  },
  21: {
    ability: 6,
    battle: 1,
    vitality: 4,
  },
};
export const ENEMY_ATTACK_MULTIPLIER_CHANCE = [
  { amount: 1, probability: 70 },
  { amount: 1.3, probability: 11 },
  { amount: 1.6, probability: 9 },
  { amount: 1.8, probability: 7 },
  { amount: 2, probability: 3 },
];
