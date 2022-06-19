import { HolyBlessings } from './Types';

export const LAST_DUNGEON_LEVEL = 5;

export const BLESSES_DIFFERENCE_LIMIT = 15;

export const MOB_LIMIT_PER_DUNGEON_LEVEL = 5;

export const BASE_XP = 120;

export const DIFFICULT_TO_LEVEL_UP = 1.62;

export const ELEMENT_SINERGY_BONUS_IN_PERCENTAGE = 5;

export const USER_BATTLE_LEVEL = 20;

export const ABILITY_BATTLE_LEVEL = 2;

export const PVE_USER_RESPONSE_TIME_LIMIT = 20_000;

export const PVP_USER_RESPONSE_TIME_LIMIT = 20_000;

// CHURCH
export const BASE_LIFE_PER_CICLE = 167;
export const MAX_USER_LIFE_TO_MULTIPLY = 800;
export const BASE_MANA_PER_CICLE = 100;
export const MAX_USER_MANA_TO_MULTIPLY = 600;
export const CICLE_DURATION_IN_MINUTES = 60;
export const MINUTES_COOLDOWN_TO_RECHURCH = 45;

export const ROLEPLAY_COOLDOWNS = {
  dungeonCooldown: 3_600_000,
  deathPunishment: 3_600_000,
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
    ability: 10,
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
    ability: 20,
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
    ability: 60,
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
  { amount: 1, probability: 75 },
  { amount: 1.3, probability: 11 },
  { amount: 1.6, probability: 8 },
  { amount: 1.8, probability: 5 },
  { amount: 2, probability: 1 },
];
