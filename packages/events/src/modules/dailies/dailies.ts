/* eslint-disable camelcase */
import { calculateProbability } from '../../utils/miscUtils';
import { StaticItemData } from '../hunt/types';
import { Daily } from './types';

export const FINISHED_DAILY_AWARD = 5_000;
export const STARS_PRIZE = 7_000;
export const SEED_AMOUNT = 3;
export const PLANT_AMOUNT = 1;
export const ROLLS_COUNT = 1;
export const HUNT_AMOUNT = 2;
export const DAILIES_AMOUNT = 3;

const AvailableAwards = [
  {
    value: 'seed' as const,
    probability: 75,
  },
  {
    value: 'roll' as const,
    probability: 50,
  },
  {
    value: 'hunt' as const,
    probability: 50,
  },
  {
    value: 'estrelinhas' as const,
    probability: 33,
  },
  {
    value: 'plant' as const,
    probability: 15,
  },
];

export type AwardValues = (typeof AvailableAwards)[number]['value'];

const Dailies: Record<number, Daily> = {
  1: {
    type: 'use_command',
    name: 'mamar',
    amountLimits: [6, 18],
  },
  2: {
    type: 'use_command',
    name: '8ball',
    amountLimits: [5, 10],
  },
  3: {
    type: 'use_command',
    name: 'vergonha',
    amountLimits: [7, 12],
  },
  4: {
    type: 'win_bet',
    amountLimits: [3, 10],
    bet: 'blackjack',
  },
  5: {
    type: 'win_bet',
    amountLimits: [5, 15],
    bet: 'roleta',
  },
  6: {
    type: 'win_bet',
    amountLimits: [1, 2],
    bet: 'bicho',
  },
  7: {
    type: 'win_stars_in_bets',
    amountLimits: [10000, 50000],
  },
};

const getDailyById = <D extends Daily>(id: number): D => {
  if (typeof Dailies[id] === 'undefined') throw new Error(`There is no daily with ID ${id}`);

  return Dailies[id] as D;
};

const getAllDailies = (): StaticItemData<Daily>[] =>
  Object.entries(Dailies).map((d) => ({ id: Number(d[0]), data: d[1] }));

const getRandomAward = (): AwardValues =>
  calculateProbability<(typeof AvailableAwards)[number]>(AvailableAwards);

export { getDailyById, getAllDailies, getRandomAward };
