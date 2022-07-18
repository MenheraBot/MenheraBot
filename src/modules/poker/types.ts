import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  IUserSchema,
} from '@custom_types/Menhera';
import { CommandInteraction } from 'discord.js-light';
import MenheraClient from 'MenheraClient';

export type PokerRoundAction = 'PRE-FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export type PokerPlayAction = 'FOLD' | 'CHECK' | 'CALL' | 'RAISE' | 'ALL-IN';

export interface PokerPlayerData {
  hand: number[];
  folded: boolean;
  allIn: boolean;
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
  quittedPlayers: string[];
}

export type CARD_SUITE = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';

export interface PokerCard {
  id: number;
  value: number;
  displayValue: string;
  suit: CARD_SUITE;
  solverValue: string;
}

export type PokerUserData = Pick<IUserSchema, 'estrelinhas' | 'selectedColor' | 'id'> & {
  backgroundTheme: AvailableCardBackgroundThemes;
  cardTheme: AvailableCardThemes;
};
