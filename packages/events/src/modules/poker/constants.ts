import { PokerWinReasons } from './types';

export const MAX_POKER_PLAYERS = 8;
export const DEFAULT_CHIPS = 50_000;
export const AFTER_MATCH_SHUTDOWN_TIMEOUT_IN_MINUTES = 2;
export const AUTO_FOLD_TIMEOUT_IN_SECONDS = 30;

export const winReasons: readonly Lowercase<PokerWinReasons>[] = Object.freeze([
  'flush',
  'folded',
  'four_of_a_kind',
  'full_house',
  'high_card',
  'pair',
  'royal_flush',
  'straight',
  'straight_flush',
  'three_of_a_kind',
  'two_pair',
]);
