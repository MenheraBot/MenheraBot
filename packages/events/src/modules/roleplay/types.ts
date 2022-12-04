export interface HolyBlessings {
  ability: number;
  vitality: number;
  battle: number;
}

export interface InventoryItem {
  id: number;
  level: number;
  amount: number;
}

export interface UserAbility {
  id: number;
  level: number;
  blesses: number;
}

export interface LeveledItem {
  id: number;
  level: number;
}

export type CooldownReason = 'dungeon' | 'church';

export interface UserCooldown {
  reason: CooldownReason;
  until: number;
  data?: unknown;
}

type Blesses = 1; // TODO

export interface DatabaseRoleplayUserSchema {
  id: string;
  class: number;
  race: number;
  life: number;
  mana: number;
  level: number;
  experience: number;
  holyBlessings: HolyBlessings;
  blesses: Blesses;
  abilities: UserAbility[];
  inventory: InventoryItem[];
  cooldowns: UserCooldown[];
  weapon: LeveledItem;
  protection: LeveledItem;
  backpack: LeveledItem;
  money: number;
}
