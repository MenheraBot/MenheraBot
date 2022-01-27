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

export type ItemType = 'Arma';

export interface InventoryItem {
  type: ItemType;
  name: string;
  value: number;
}
export interface Weapon {
  damage: number;
  name: string;
  type: string;
}

export interface Armor {
  armor: number;
  name: string;
}

export interface Backpack {
  name: string;
  capacity: number;
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
  loots: Array<Exclude<InventoryItem, InventoryItem['type']>>;
  inventory: Array<InventoryItem>;
  weapon: Weapon;
  protection: Armor;
  backpack: Backpack;
  money: number;
  dungeonCooldown: number;
  death: number;
  hotelTime: number;
  inBattle: boolean;
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

export type DungeonLevels = 1 | 2 | 3 | 4 | 5;
