/* eslint-disable @typescript-eslint/ban-types */
import { TMagicItemsFile } from '@utils/Types';

const HuntMagicItems: { [id: number]: TMagicItemsFile } & Object = {
  1: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'demons',
    probabilities: [
      { amount: 1, probabilty: 38 },
      { amount: 2, probabilty: 24 },
      { amount: 4, probabilty: 15 },
      { amount: 3, probabilty: 12 },
      { amount: 5, probabilty: 11 },
    ],
    cost: 450_000,
  },
  2: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'giants',
    probabilities: [
      { amount: 1, probabilty: 46 },
      { amount: 2, probabilty: 19 },
      { amount: 4, probabilty: 18 },
      { amount: 0, probabilty: 10 },
      { amount: 3, probabilty: 7 },
    ],
    cost: 600_000,
  },
  3: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'angels',
    probabilities: [
      { amount: 1, probabilty: 60 },
      { amount: 0, probabilty: 20 },
      { amount: 2, probabilty: 15 },
      { amount: 3, probabilty: 5 },
    ],
    cost: 780_000,
  },
  4: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'archangels',
    probabilities: [
      { amount: 1, probabilty: 47 },
      { amount: 0, probabilty: 34 },
      { amount: 2, probabilty: 15 },
      { amount: 3, probabilty: 4 },
    ],
    cost: 900_000,
  },
  5: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'demigods',
    probabilities: [
      { amount: 1, probabilty: 55 },
      { amount: 0, probabilty: 40 },
      { amount: 2, probabilty: 5 },
    ],
    cost: 1_250_000,
  },
  6: {
    type: 'HUNT_PROBABILITY_BOOST',
    huntType: 'gods',
    probabilities: [
      { amount: 0, probabilty: 82 },
      { amount: 1, probabilty: 18 },
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

export default HuntMagicItems;
