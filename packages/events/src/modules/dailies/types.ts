/* eslint-disable camelcase */
type DailyTypes = 'use_command' | 'win_bet' | 'win_stars_in_bets';

interface BaseDaily {
  type: DailyTypes;
  amountLimits: [number, number];
}

interface UseCommandDaily extends BaseDaily {
  type: 'use_command';
  name: string;
}

interface WinBetDaily extends BaseDaily {
  type: 'win_bet';
  bet: 'blackjack' | 'roleta' | 'bicho';
}

interface WinStarsInBet extends BaseDaily {
  type: 'win_stars_in_bets';
}

export type DatabaseDaily = { id: number; need: number; has: number; redeemed: boolean };

export type Daily = UseCommandDaily | WinBetDaily | WinStarsInBet;
