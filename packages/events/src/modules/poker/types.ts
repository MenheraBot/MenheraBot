import { AvailableCardBackgroundThemes, AvailableCardThemes } from '../themes/types';

export interface PokerPlayer {
  id: string;
  name: string;
  avatar: string;
  backgroundTheme: AvailableCardBackgroundThemes;
  cardTheme: AvailableCardThemes;
  chips: number;
  willExit: boolean;
  seatId: number;
  cards: [number, number];
  pot: number;
  folded: boolean;
}

type GameStages = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type Action = 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'ALLIN';

export type CARD_SUITE = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';

export interface PokerCard {
  id: number;
  value: number;
  displayValue: string;
  suit: CARD_SUITE;
  solverValue: string;
}

export interface PokerMatch {
  matchId: string;
  masterId: string;
  inMatch: boolean;
  worthGame: boolean;
  embedColor: number;
  players: PokerPlayer[];
  communityCards: [number, number, number, number, number];
  stage: GameStages;
  dealerSeat: number;
  winnerSeat: number[];
  lastPlayerSeat: number;
  seatToPlay: number;
  blind: number;
  raises: number;
  pot: number;
  lastAction: {
    action: Action;
    pot: number;
    playerSeat: number;
  };
}

export enum TimerActionType {
  DELETE_GAME,
}

export interface DeleteMatchTimer {
  type: TimerActionType;
  matchId: string;
}

export type PokerTimerAction = DeleteMatchTimer;
