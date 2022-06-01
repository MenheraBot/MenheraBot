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

export type Elements = 'FIRE' | 'WATER' | 'NATURE' | 'AIR' | 'LIGHT' | 'DARK' | 'NEUTRAL';

export type ClassesFile = {
  name: string;
  attributesPerLevel: BaseAttributesPerLevel;
  elementSinergy: Elements;
  starterAbility: number;
} & BaseAttributesPerLevel;

export interface FacilityType {
  facility: keyof BaseAttributesPerLevel;
  boostPerLevel: number;
}

export interface RacesFile {
  name: string;
  facilities: FacilityType[];
}

export interface ScalableWithInteligence {
  readonly scale: number;
  base: number;
}

export type BattleTarget = 'self' | 'enemy';

export type EffectType =
  | 'damage'
  | 'heal'
  | 'poison'
  | `${Exclude<keyof Blesses, 'maxLife' | 'maxMana'>}_buff`
  | `${Exclude<keyof Blesses, 'maxLife' | 'maxMana'>}_debuff`;

export type EffectValueRefflection = 'plain' | keyof Blesses;

export interface AbilityEffect {
  target: BattleTarget;
  durationInTurns: number;
  element: Elements;
  effectType: EffectType;
  effectValue: number;
  effectValueByIntelligence: number;
  effectValueModifier: 'plain' | 'percentage';
  effectValueRefflection: EffectValueRefflection;
  effectValuePerLevel: number;
}

export interface AbilitiesFile {
  DevDesc: string;
  parentId: number;
  cost: number;
  costPerLevel: number;
  unlockCost: number;
  effects: AbilityEffect[];
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

export interface EffectAuthor {
  totalIntelligence: number;
  elementSinergy: Elements;
}

export interface ReadyToBattleEnemy {
  id: number;
  life: number;
  agility: number;
  damage: number;
  armor: number;
  experience: number;
  level: number;
  effects: Array<AbilityEffect & { level: number; author: EffectAuthor }>;
  loots: EnemyDrops[];
}

interface Upgradable {
  // COST === 0 AND ITEMS.LENGTH === 0 MEANS CANNOT DO
  cost: number; // Valor para fazer
  items: number[]; // Itens usados
}

export interface ToUpgrade {
  [level: number]: Upgradable;
}

export type ToCraft = Upgradable;

export interface UpgradableItem {
  toUpgrade: ToUpgrade;
  toCraft: ToCraft;
}

export interface BackPackItem extends UpgradableItem {
  type: 'backpack';
  capacity: number;
  perLevel: number;
}

export interface WeaponItem extends UpgradableItem {
  type: 'weapon';
  damage: number;
  perLevel: number;
}

export interface ProtectionItem extends UpgradableItem {
  type: 'protection';
  armor: number;
  perLevel: number;
}

export interface DropItem {
  type: 'enemy_drop';
  marketValue: number;
  perLevel: number;
}

export interface ConsumableItem {
  type: 'potion';
  boostType: 'life' | 'mana';
  marketValue: number;
  baseBoost: number;
  perLevel: number;
}

export type ItemsFile = BackPackItem | WeaponItem | DropItem | ConsumableItem | ProtectionItem;

export type UserBattleEntity = RoleplayUserSchema & {
  effects: Array<AbilityEffect & { level: number; author: EffectAuthor }>;
};

export type UserBattleConfig = Blesses;

export type BattleUserTurn = 'attacker' | 'defender';
