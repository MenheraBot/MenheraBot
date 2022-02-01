export interface NormalAbility {
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  heal: number;
  cost: number | string;
}

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
export interface Weapon {
  damage: number;
  name: string;
  type: string;
}

export interface Armor {
  armor: number;
  name: string;
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

export type CooldownReason = 'dungeon' | 'death';

export interface UserCooldown {
  reason: CooldownReason;
  until: number;
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

interface BaseAttributesPerLevel {
  maxLife: number;
  maxMana: number;
  baseArmor: number;
  baseDamage: number;
  baseIntelligence: number;
}

export type ClassesNameDefinition =
  | 'assassin'
  | 'mage'
  | 'sorcerer'
  | 'illusionist'
  | 'archmage'
  | 'necromancer'
  | 'barbarian'
  | 'archer'
  | 'paladin'
  | 'tamer';

export type RacesNameDefinition = 'elf' | 'human' | 'orc' | 'half-demon' | 'demi-human' | 'fear';

export type AvailableStatuses = Exclude<keyof BaseAttributesPerLevel, 'holyBlessings'>;

export interface ClassesFile {
  name: ClassesNameDefinition;
  attributesPerLevel: BaseAttributesPerLevel;
  baseMaxMana: number;
  baseMaxLife: number;
  baseArmor: number;
  baseDamage: number;
  baseIntelligence: number;
  abilityTree: number;
}

export interface FacilityType {
  facility: AvailableStatuses;
  boostPerLevel: number;
}

export interface RacesFile {
  name: RacesNameDefinition;
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

export interface EnemyLoot {
  id: number;
  level: number;
}

export interface EnemyDrops {
  probability: number;
  loots: EnemyLoot[];
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

export type ItemsFile = BackPackItem | WeaponItem;
