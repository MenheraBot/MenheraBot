import { ApiHuntingTypes, DatabaseHuntingTypes } from '../modules/hunt/types';
import { PokerWinReasons } from '../modules/poker/types';

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

export type ApiPokerUserStats = ApiGamblingGameStats & Record<Lowercase<PokerWinReasons>, number>;

export interface ApiUserProfileStats {
  totalUses: number;
  topCommand: { name: string; uses: number };
}

export type MayReturnError<T> = T | { error: true };

export type ApiGamblingGameCompatible = 'coinflip' | 'blackjack' | 'roulette' | 'bicho';

export type TopHunters<Hunt extends ApiHuntingTypes> = {
  user_id: string;
} & Pick<ApiHuntStats, `${Hunt}_success` | `${Hunt}_hunted` | `${Hunt}_tries`>;

export type TopGamblingUser = {
  user_id: string;
  earn_money: number;
  lost_games: number;
  lost_money: number;
  won_games: number;
};

export enum ApiTransactionReason {
  SIMON_SAYS = 'simon_says',
  PIX_COMMAND = 'pix_command',
  BLACKJACK_COMMAND = 'blackjack_command',
  BLACKJACK_LOST_DATA = 'blackjack_lost_data',
  COINFLIP_COMMAND = 'coinflip_command',
  HUNT_COMMAND = 'hunt_command',
  ROULETTE_COMMAND = 'roulette_command',
  BICHO_COMMAND = 'bicho_command',
  WIN_BICHO = 'win_bicho',
  SELL_HUNT = 'sell_hunt',
  BUY_COLOR = 'buy_color',
  BUY_ROLL = 'buy_roll',
  BUY_ITEM = 'buy_item',
  BUY_IMAGE = 'buy_image',
  BUY_IMAGE_ROYALTY = 'buy_image_royalty',
  BUY_THEME = 'buy_theme',
  BUY_THEME_ROYALTY = 'buy_theme_royalty',
  VOTE_THANK = 'vote_thank',
  INACTIVITY_PUNISHMENT = 'inactivity_punishment',
  POKER_COMMAND = 'poker_command',
  SELL_PLANT = 'sell_plant',
  BUY_SEED = 'buy_seed',
  UPGRADE_FARM = 'upgrade_farm',
  DAILY_FARM = 'daily_farm',
  BUY_FAIR = 'buy_fair',
  ROCK_PAPER_SCISSORS_COMMAND = 'rps_command',
}

type TransactionType = DatabaseHuntingTypes | 'estrelinhas';

export interface TransactionRegister {
  authorId: string;
  targetId: string;
  amount: number;
  currencyType: TransactionType;
  reason: ApiTransactionReason;
  date: number;
}

export interface BanInfo {
  date: string;
  reason: string;
}
