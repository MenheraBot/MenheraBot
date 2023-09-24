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
  folded: boolean;
}

type GameStages = 'preflop' | 'flop' | 'turn' | 'river';

export interface PokerMatch {
  masterId: string;
  embedColor: number;
  players: PokerPlayer[];
  deck: [number, number, number, number, number];
  stage: GameStages;
  dealer: number;
  pot: number;
}
