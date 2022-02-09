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
  agility: number;
  armor: number;
  damage: number;
  intelligence: number;
}

export type CooldownReason = 'dungeon' | 'church';

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
  agility: number;
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
  baseAgility: number;
  baseArmor: number;
  baseDamage: number;
  baseIntelligence: number;
}

export type ClassesFile = {
  name: string;
  attributesPerLevel: BaseAttributesPerLevel;
  abilityTree: number;
} & BaseAttributesPerLevel;

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

export interface EnemyDrops {
  probability: number;
  loots: LeveledItem[];
}

interface EnemyBoostPerLevel {
  baseDamage: number;
  baseLife: number;
  baseArmor: number;
  baseAgility: number;
  experience: number;
}

export type EnemiesFile = {
  statsPerPhase: EnemyBoostPerLevel;
  dungeonLevels: number[];
  loots: EnemyDrops[];
} & EnemyBoostPerLevel;

export interface ReadyToBattleEnemy {
  id: number;
  life: number;
  damage: number;
  armor: number;
  experience: number;
  level: number;
  loots: EnemyDrops[];
}

export type ItemFlag = 'droppable' | 'sellable' | 'buyable' | 'consumable' | 'upgradable';

export interface ToUpgrade {
  cost: number;
  costPerLevel: number;
  boostPerUpgrade: number;
}

export interface BackPackItem {
  type: 'backpack';
  capacity: number;
  perLevel: number;
  toUpgrade: ToUpgrade;
  flags: ItemFlag[];
}

export interface WeaponItem {
  type: 'weapon';
  damage: number;
  perLevel: number;
  toUpgrade: ToUpgrade;
  flags: ItemFlag[];
}

export interface ProtectionItem {
  type: 'protection';
  armor: number;
  perLevel: number;
  toUpgrade: ToUpgrade;
  flags: ItemFlag[];
}

export interface DropItem {
  type: 'enemy_drop';
  marketValue: number;
  perLevel: number;
  flags: ItemFlag[];
}

export interface ConsumableItem {
  type: 'potion';
  boostType: 'life' | 'mana';
  marketValue: number;
  baseBoost: number;
  perLevel: number;
  flags: ItemFlag[];
}

export type ItemsFile = BackPackItem | WeaponItem | DropItem | ConsumableItem | ProtectionItem;
