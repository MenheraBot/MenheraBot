import { BigString } from 'discordeno/types';

export interface BetPlayer {
  id: BigString;
  bet: number;
  option: string;
}

export interface BichoGame {
  dueDate: number;
  results: number[][];
  bets: BetPlayer[];
  biggestProfit: number;
}

export interface BichoWinner {
  id: string;
  profit: number;
  bet: number;
  didWin: boolean;
}

export type BichoBetType =
  | 'unity'
  | 'ten'
  | 'hundred'
  | 'thousand'
  | 'animal'
  | 'sequence'
  | 'corner';
