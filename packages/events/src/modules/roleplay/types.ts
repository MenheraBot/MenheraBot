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
};

export type PlayerVsEnviroment = {
  id: string;
  user: InBattleUser;
  enemy: InBattleEnemy;
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
