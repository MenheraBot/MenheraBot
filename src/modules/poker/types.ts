import { CommandInteraction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export type PokerRoundAction = 'PRE-FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export type PokerPlayAction = 'FOLD' | 'CHECK' | 'CALL' | 'RAISE' | 'ALL-IN';

export interface PokerPlayerData {
  hand: number[];
  bet: number;
  folded: boolean;
}

export interface PokerRoundData {
  dealerId: string;
  smallBlindId: string;
  bigBlindId: string | null;
  cards: number[];
  comunityCards: number[];
  players: Map<string, PokerPlayerData>;
  currentAction: PokerRoundAction;
  currentPlayer: string;
  lastPlayer: string;
  lastPlayerToPlay: string;
  currentBet: number;
  pot: number;
}

export interface PokerTableData {
  lastDealerIndex: number;
  blindBet: number;
  mainInteraction: CommandInteraction & { client: MenheraClient };
  inGame: boolean;
}

export type CARD_SUITE = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';

export interface PokerCard {
  id: number;
  value: number;
  displayValue: string;
  suit: CARD_SUITE;
}
