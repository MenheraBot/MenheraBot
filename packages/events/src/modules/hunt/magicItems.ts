import { MagicItemsFile } from './types';

const HuntMagicItems: { [id: number]: MagicItemsFile } /* & Object */ = {
  1: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'demons',
    probabilities: [
      { amount: 1, probability: 38 },
      { amount: 2, probability: 24 },
      { amount: 4, probability: 15 },
      { amount: 3, probability: 12 },
      { amount: 5, probability: 11 },
    ],
    cost: 450_000,
  },
  2: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'giants',
    probabilities: [
      { amount: 1, probability: 46 },
      { amount: 2, probability: 19 },
      { amount: 3, probability: 18 },
      { amount: 0, probability: 10 },
      { amount: 4, probability: 7 },
    ],
    cost: 600_000,
  },
  3: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'angels',
    probabilities: [
      { amount: 1, probability: 60 },
      { amount: 0, probability: 20 },
      { amount: 2, probability: 15 },
      { amount: 3, probability: 5 },
    ],
    cost: 780_000,
  },
  4: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'archangels',
    probabilities: [
      { amount: 1, probability: 47 },
      { amount: 0, probability: 34 },
      { amount: 2, probability: 15 },
      { amount: 3, probability: 4 },
    ],
    cost: 900_000,
  },
  5: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'demigods',
    probabilities: [
      { amount: 1, probability: 55 },
      { amount: 0, probability: 40 },
      { amount: 2, probability: 5 },
    ],
    cost: 1_250_000,
  },
  6: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'gods',
    probabilities: [
      { amount: 0, probability: 82 },
      { amount: 1, probability: 18 },
    ],
    cost: 1_500_000,
  },
  7: {
    type: 'HUNT_COOLDOWN_REDUCTION',
    dropChance: 0.682,
    huntType: 'demons',
    huntCooldown: 2700000,
    rarity: 'epic',
  },
  8: {
    type: 'HUNT_COOLDOWN_REDUCTION',
    dropChance: 0.46,
    huntType: 'giants',
    huntCooldown: 2700000,
    rarity: 'epic',
  },
  9: {
    type: 'HUNT_COOLDOWN_REDUCTION',
    dropChance: 0.32156,
    huntType: 'angels',
    huntCooldown: 2700000,
    rarity: 'legendary',
  },
  10: {
    type: 'HUNT_COOLDOWN_REDUCTION',
    dropChance: 0.22216,
    huntType: 'archangels',
    huntCooldown: 2700000,
    rarity: 'legendary',
  },
  11: {
    type: 'HUNT_COOLDOWN_REDUCTION',
    dropChance: 0.11985,
    huntType: 'demigods',
    huntCooldown: 2700000,
    rarity: 'legendary',
  },
  12: {
    type: 'HUNT_COOLDOWN_REDUCTION',
    dropChance: 0.0666,
    huntType: 'gods',
    huntCooldown: 2700000,
    rarity: 'mythical',
  },
};

export { HuntMagicItems };
