import { AvailableCardBackgroundThemes, AvailableCardThemes } from '../themes/types';

export interface PokerPlayer {
  id: string;
  name: string;
  avatar: string;
  backgroundTheme: AvailableCardBackgroundThemes;
  cardTheme: AvailableCardThemes;
  chips: number;
  seatId: number;
  cards: [number, number];
  pot: number;
  folded: boolean;
}

type GameStages = 'preflop' | 'flop' | 'turn' | 'river';

export type Action = 'FOLD' | 'CHECK' | 'CALL' | 'RAISE' | 'ALLIN';

export interface PokerMatch {
  matchId: string;
  masterId: string;
  embedColor: number;
  players: PokerPlayer[];
  deck: [number, number, number, number, number];
  stage: GameStages;
  dealerSeat: number;
  seatToPlay: number;
  pot: number;
  lastAction: {
    action: Action;
    pot: number;
    playerSeat: number;
  };
}
