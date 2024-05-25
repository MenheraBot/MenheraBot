/* eslint-disable camelcase */
import { StaticItemData } from '../hunt/types';
import { Daily } from './types';

export const FINISHED_DAILY_AWARD = 5_000;
export const DAILIES_AMOUNT = 3;

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

export { getDailyById, getAllDailies };
