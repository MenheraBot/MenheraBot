import { BigString } from 'discordeno/types';

export interface BetPlayer {
  id: BigString;
  bet: number;
  option: string;
}

export interface BichoGameInfo {
  dueDate: number;
  results: number[][];
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
