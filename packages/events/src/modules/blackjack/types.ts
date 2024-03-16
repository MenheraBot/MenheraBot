import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableTableThemes,
} from '../themes/types';

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

export type StoredBlackjackState = {
  bet: number;
  secondCopy: boolean;
  playerCards: number[];
  dealerCards: number[];
  matchCards: number[];
  cardTheme: AvailableCardThemes;
  tableTheme: AvailableTableThemes;
  cardBackgroundTheme: AvailableCardBackgroundThemes;
};
