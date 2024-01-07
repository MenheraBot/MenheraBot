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
