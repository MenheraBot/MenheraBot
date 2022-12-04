import { ApiHuntingTypes } from '../modules/hunt/types';

/* eslint-disable camelcase */
export interface ApiHuntStats {
  user_id: string;
  demon_tries: number;
  demon_success: number;
  demon_hunted: number;
  giant_tries: number;
  giant_success: number;
  giant_hunted: number;
  angel_tries: number;
  angel_success: number;
  angel_hunted: number;
  archangel_tries: number;
  archangel_success: number;
  archangel_hunted: number;
  demigod_tries: number;
  demigod_success: number;
  demigod_hunted: number;
  god_tries: number;
  god_success: number;
  god_hunted: number;
  error?: boolean;
}

export interface ApiGamblingGameStats {
  playedGames: number;
  lostGames: number;
  winGames: number;
  winMoney: number;
  lostMoney: number;
  winPorcentage: string;
  lostPorcentage: string;
  error?: boolean;
}

export interface ApiUserProfileStats {
  cmds: { count: number };
  array: Array<{ name: string; count: number }>;
}

export type MayReturnError<T> = T | { error: true };

export type ApiGamblingGameCompatible = 'coinflip' | 'blackjack' | 'roulette' | 'bicho';

export type TopHunters<Hunt extends ApiHuntingTypes> = {
  user_id: string;
} & Pick<ApiHuntStats, `${Hunt}_success` | `${Hunt}_hunted` | `${Hunt}_tries`>;

export type RouletteOrBichoTop = {
  user_id: string;
  earn_money: number;
  lost_games: number;
  lost_money: number;
  won_games: number;
};

export interface BlackjackTop {
  id: string;
  bj_wins: number;
  bj_win_money: number;
  bj_loses: number;
  bj_lose_money: number;
}

export interface CoinflipTop {
  id: string;
  cf_wins: number;
  cf_win_money: number;
  cf_loses: number;
  cf_lose_money: number;
}
