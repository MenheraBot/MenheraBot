import { DatabaseCharacterSchema } from '../../types/database';
import { AvailableLanguages } from '../../types/i18next';
import { InventoryItemID } from './data/items';

export type Enemy = {
  $devName: string;
  id: number;
  life: number[];
  damage: number[];
  drops: {
    id: number;
    amount: number;
  }[][];
};

type AbilityType = 'damage' | 'heal';

export type AbilityEffect = {
  applyTo: 'enemy' | 'player';
  value: number;
  type: AbilityType;
  timesToApply?: number;
};

export type Ability = {
  energyCost: number;
  effects: AbilityEffect[];
};

export interface InventoryItem {
  id: InventoryItemID;
  amount: number;
}

export type BattleEffect = Required<Omit<AbilityEffect, 'applyTo'>>;

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

export type BattleEntity = InBattleEnemy | InBattleUser;

export type PlayerVsEnviroment = {
  id: string;
  user: InBattleUser;
  enemy: InBattleEnemy;
  interactionToken: string;
  language: AvailableLanguages;
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

export type Location = [number, number];

export enum Action {
  NONE,
  TRAVEL,
  DEATH,
  CHURCH,
}

export type TravelAction = {
  type: Action.TRAVEL;
  from: Location;
  to: Location;
  startAt: number;
};

export type DeathAction = {
  type: Action.DEATH;
  reviveAt: number;
};

type ChurchAction = {
  type: Action.CHURCH;
  startAt: number;
};

type NoneAction = {
  type: Action.NONE;
};

export type AvailableActions = TravelAction | NoneAction | DeathAction | ChurchAction;
