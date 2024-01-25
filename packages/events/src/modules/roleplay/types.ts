import { DatabaseCharacterSchema } from '../../types/database';

export type Enemy = {
  $devName: string;
  id: number;
  life: number[];
  damage: number[];
  drops: {
    id: number;
    level: number;
    amount: number;
  }[][];
};

type AbilityType = 'damage';

export type AbilityEffect = {
  applyTo: 'enemy' | 'player';
  value: number;
  type: AbilityType;
  repeatRounds?: number;
};

export type Ability = {
  $devName: string;
  energyCost: number;
  effects: AbilityEffect[];
};

export interface InventoryItem {
  id: number;
  level: number;
  amount: number;
}

type BattleEffect = Required<Omit<AbilityEffect, 'applyTo'>>;

export type InBattleEnemy = {
  id: number;
  life: number;
  damage: number;
  level: number;
  $devName: string;
  effects: BattleEffect[];
};

export interface AbilityEntity {
  id: number;
  proficiente: number;
}

export type InBattleUser = {
  id: string;
  life: number;
  energy: number;
  damage: number;
  abilitites: DatabaseCharacterSchema['abilities'];
  inventory: InventoryItem[];
  effects: BattleEffect[];
};

export type PlayerVsEnviroment = {
  id: string;
  user: InBattleUser;
  enemy: InBattleEnemy;
  interactionToken: string;
  language: string;
};

export enum BattleTimerActionType {
  FORCE_FINISH_BATTLE,
  TIMEOUT_CHOICE,
}

export interface ForceFinishTimer {
  type: BattleTimerActionType.FORCE_FINISH_BATTLE;
  battleId: string;
  executeAt: number;
}

export interface TimeoutChoiceTimer {
  type: BattleTimerActionType.TIMEOUT_CHOICE;
  battleId: string;
  executeAt: number;
}

export type BattleTimer = ForceFinishTimer | TimeoutChoiceTimer;
