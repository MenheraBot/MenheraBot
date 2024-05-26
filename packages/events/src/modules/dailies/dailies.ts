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
    probability: 50,
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
  20: {
    type: 'use_command',
    specifications: [], // This is populated at loadCommands
    amountLimits: [6, 18],
  },
  21: {
    type: 'announce_product',
    amountLimits: [2, 3],
  },
  22: {
    type: 'success_on_hunt',
    amountLimits: [3, 6],
  },
  23: {
    type: 'use_action_commands',
    amountLimits: [5, 14],
  },
  24: {
    type: 'win_stars_in_bets',
    amountLimits: [10000, 40000],
  },
  25: {
    type: 'win_bet',
    amountLimits: [1, 2],
    specifications: ['bicho'],
  },
  26: {
    type: 'win_bet',
    amountLimits: [3, 10],
    specifications: ['blackjack', 'roleta'],
  },
};

const populateCommand = (command: string): void => {
  Dailies[20].specifications?.push(command);
};

const getDailyById = <D extends Daily>(id: number): D => {
  if (typeof Dailies[id] === 'undefined') throw new Error(`There is no daily with ID ${id}`);

  return Dailies[id] as D;
};

const getAllDailies = (): StaticItemData<Daily>[] =>
  Object.entries(Dailies).map((d) => ({ id: Number(d[0]), data: d[1] }));

const getRandomAward = (): AwardValues =>
  calculateProbability<(typeof AvailableAwards)[number]>(AvailableAwards);

export { getDailyById, getAllDailies, getRandomAward, populateCommand };
