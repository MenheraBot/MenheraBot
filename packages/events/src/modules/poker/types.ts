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

export type Action = 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'RAISE-CUSTOM' | 'ALLIN';

export type CARD_SUITE = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';

export interface PokerCard {
  displayValue: string;
  solverValue: string;
}

export interface PokerMatch {
  matchId: string;
  language: string;
  masterId: string;
  inMatch: boolean;
  worthGame: boolean;
  interactionToken: string;
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
  TIMOEUT_FOLD,
}

export interface DeleteMatchTimer {
  type: TimerActionType.DELETE_GAME;
  matchId: string;
  executeAt: number;
}

export interface TimeoutFoldTimer {
  type: TimerActionType.TIMOEUT_FOLD;
  executeAt: number;
  matchId: string;
}

export type PokerTimer = DeleteMatchTimer | TimeoutFoldTimer;
