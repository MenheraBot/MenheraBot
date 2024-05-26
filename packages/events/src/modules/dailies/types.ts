import { AwardValues } from './dailies';

/* eslint-disable camelcase */
type DailyTypes =
  | 'use_command'
  | 'win_bet'
  | 'win_stars_in_bets'
  | 'announce_product'
  | 'success_on_hunt'
  | 'use_action_commands';

export interface Daily {
  type: DailyTypes;
  amountLimits: [number, number];
  specifications?: string[];
}

export type Award<Helper extends number | string> = {
  type: AwardValues;
  value: number;
  helper?: Helper;
};

export type DatabaseDaily = {
  id: number;
  need: number;
  has: number;
  redeemed: boolean;
  specification?: string;
  awards: [Award<number | string>, Award<number | string>, Award<number | string>];
};
