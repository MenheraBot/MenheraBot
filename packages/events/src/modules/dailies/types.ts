import { AwardValues } from './dailies';

/* eslint-disable camelcase */
type DailyTypes =
  | 'use_command'
  | 'win_bet'
  | 'win_stars_in_bets'
  | 'announce_product'
  | 'success_on_hunt';

interface BaseDaily {
  type: DailyTypes;
  amountLimits: [number, number];
}

interface UseCommandDaily extends BaseDaily {
  type: 'use_command';
  name: string;
}

export interface WinBetDaily extends BaseDaily {
  type: 'win_bet';
  bet: 'blackjack' | 'roleta' | 'bicho';
}

interface WinStarsInBet extends BaseDaily {
  type: 'win_stars_in_bets';
}

interface AnnounceProduct extends BaseDaily {
  type: 'announce_product';
}

interface SuccessOnHunt extends BaseDaily {
  type: 'success_on_hunt';
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
  awards: [Award<number | string>, Award<number | string>, Award<number | string>];
};

export type Daily = UseCommandDaily | WinBetDaily | WinStarsInBet | AnnounceProduct | SuccessOnHunt;
