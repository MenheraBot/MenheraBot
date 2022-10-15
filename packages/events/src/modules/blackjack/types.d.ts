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
