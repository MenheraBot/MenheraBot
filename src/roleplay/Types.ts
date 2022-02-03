export interface UserAbility {
  id: number;
  level: number;
  blesses: number;
}

export interface InventoryItem {
  id: number;
  level: number;
  amount: number;
}

export interface LeveledItem {
  id: number;
  level: number;
}

export interface HolyBlessings {
  ability: number;
  vitality: number;
  battle: number;
}

export interface Blesses {
  maxLife: number;
  maxMana: number;
  armor: number;
  damage: number;
  intelligence: number;
}

export type CooldownReason = 'dungeon' | 'death' | 'church';

export interface UserCooldown {
  reason: CooldownReason;
  until: number;
  data?: unknown;
}

export interface RoleplayUserSchema {
  id: string;
  class: number;
  race: number;
  life: number;
  mana: number;
  level: number;
  experience: number;
  holyBlessings: HolyBlessings;
  blesses: Blesses;
  abilities: Array<UserAbility>;
  inventory: Array<InventoryItem>;
  cooldowns: UserCooldown[];
  weapon: LeveledItem;
  protection: LeveledItem;
  backpack: LeveledItem;
  money: number;
}

interface BaseAttributesPerLevel {
  maxLife: number;
  maxMana: number;
  baseArmor: number;
  baseDamage: number;
  baseIntelligence: number;
}

export interface ClassesFile {
  name: string;
  attributesPerLevel: BaseAttributesPerLevel;
  baseMaxMana: number;
  baseMaxLife: number;
  baseArmor: number;
  baseDamage: number;
  baseIntelligence: number;
  abilityTree: number;
}

export interface FacilityType {
  facility: keyof BaseAttributesPerLevel;
  boostPerLevel: number;
}

export interface RacesFile {
  name: string;
  facilities: FacilityType[];
}

interface PerLevelBoost {
  damage: number;
  heal: number;
  cost: number;
}

export interface ScalableWithInteligence {
  readonly scale: number;
  base: number;
}

export interface AbilitiesFile {
  DevDesc: string;
  parentId: number;
  damage: ScalableWithInteligence;
  heal: ScalableWithInteligence;
  cost: number;
  unlockCost: number;
  boostPerLevel: PerLevelBoost;
}

interface EnemyBoostPerLevel {
  baseDamage: number;
  baseLife: number;
  baseArmor: number;
  experience: number;
}

export interface EnemyDrops {
  probability: number;
  loots: LeveledItem[];
}

export interface EnemiesFile {
  baseDamage: number;
  baseLife: number;
  baseArmor: number;
  experience: number;
  perLevel: EnemyBoostPerLevel;
  dungeonLevels: number[];
  loots: EnemyDrops[];
}

export interface ReadyToBattleEnemy {
  id: number;
  life: number;
  damage: number;
  armor: number;
  experience: number;
  level: number;
  loots: EnemyDrops[];
}

export interface BackPackItem {
  type: 'backpack';
  capacity: number;
  perLevel: number;
}

export interface WeaponItem {
  type: 'weapon';
  damage: number;
  perLevel: number;
}

export interface DropItem {
  type: 'enemy_drop';
  marketValue: number;
  perLevel: number;
}

export interface ConsumableItem {
  type: 'consumable';
  boostType: 'life' | 'mana';
  marketValue: number;
  baseBoost: number;
  perLevel: number;
}

export type ItemsFile = BackPackItem | WeaponItem | DropItem | ConsumableItem;
