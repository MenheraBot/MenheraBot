import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types.js';

export interface BlackjackCard {
  value: number;
  isAce: boolean;
  id: number;
  hidden?: boolean;
}

export type BlackjackFinishGameReason =
  | 'init_blackjack'
  | 'busted'
  | 'blackjack'
  | 'draw'
  | 'biggest';

export interface StoredBlackjackState {
  bet: number;
  secondCopy: boolean;
  playerCards: number[];
  dealerCards: number[];
  matchCards: number[];
  cardTheme: AvailableCardThemes;
  tableTheme: AvailableTableThemes;
  cardBackgroundTheme: AvailableCardBackgroundThemes;
  lastAttachmentUrl: string;
}

export type BlackjackSession = {
  betAmount: number;
  profit: number;
  wins: number;
  matches: number;
  loses: number;
};
