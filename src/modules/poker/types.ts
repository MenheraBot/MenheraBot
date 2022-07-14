import { CommandInteraction, MessageComponentInteraction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export type PokerRoundAction = 'PRE-FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export type PokerPlayAction = 'FOLD' | 'CHECK' | 'CALL' | 'RAISE' | 'ALL-IN';
export interface PokerRoundData {
  dealerId: string;
  smallBlindId: string;
  bigBlindId: string | null;
  cards: number[];
  hands: Map<string, number[]>;
  currentPlay: PokerRoundAction;
  currentPlayer: string;
}

export interface PokerTableData {
  lastDealerIndex: number;
  mainInteraction: MessageComponentInteraction | (CommandInteraction & { client: MenheraClient });
}

export type CARD_SUITE = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';

export interface PokerCard {
  id: number;
  value: number;
  displayValue: string;
  suit: CARD_SUITE;
}
