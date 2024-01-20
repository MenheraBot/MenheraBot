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

export interface InventoryItem {
  id: number;
  level: number;
  amount: number;
}

export type InBattleEnemy = {
  id: number;
  life: number;
  damage: number;
  level: number;
  $devName: string;
};

export type InBattleUser = {
  id: string;
  life: number;
  energy: number;
  damage: number;
  inventory: InventoryItem[];
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
