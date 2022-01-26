export interface NormalAbility {
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  heal: number;
  cost: number | string;
}

export interface UniquePower {
  name: string;
  description: string;
  cooldown: number;
  damage: number | string;
  heal: number;
  cost: string | number;
  type: string;
}

export interface RoleplayUserSchema {
  id: string;
  class: string;
  life: number;
  armor: number;
  damage: number;
  mana: number;
  maxLife: number;
  maxMana: number;
  abilityPower: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  abilities: Array<NormalAbility | UniquePower>;
  abilitiesCooldown: Array<unknown>;
  uniquePower: UniquePower;
  loots: Array<unknown>;
  inventory: Array<unknown>;
  money: number;
  dungeonCooldown: number;
  death: number;
  weapon: { damage: number; name: string; type: string };
  protection: { armor: number };
  hotelTime: number;
  inBattle: boolean;
  backpack: unknown;
}

export interface Mob {
  loots: {
    name: string;
    value: number;
  }[];
  ataques: {
    name: string;
    damage: number;
  }[];
  type: string;
  name: string;
  life: number;
  damage: string;
  armor: number;
  xp: number;
}

export interface AttackChoice {
  name: string;
  damage: number;
  cost?: number;
  scape?: boolean;
  heal?: number;
}

export type BattleChoice = 'boss' | 'dungeon';

export type IncomingAttackChoice = AttackChoice | UniquePower | NormalAbility;

export type UserAbilities = Array<UniquePower | NormalAbility>;
