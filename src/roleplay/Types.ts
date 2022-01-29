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
  damage?: number;
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
  intelligence: number;
  armor: number;
  damage: number;
  level: number;
  experience: number;
  holyBlessings: HolyBlessings;
  blesses: Blesses;
  abilities: Array<UserAbility>;
  loots: Array<Exclude<InventoryItem, InventoryItem['type']>>;
  inventory: Array<InventoryItem>;
  cooldowns: UserCooldown[];
  death: number; // TODO: REMOVE
  dungeonCooldown: number; // TODO:  REMOVE
  hotelTime: number; // TODO: REMOVE
  weapon: Weapon;
  protection: Armor;
  backpack: Backpack;
  money: number;
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

export type DungeonLevels = 1 | 2 | 3 | 4 | 5;

interface BaseAttributesPerLevel {
  maxLife: number;
  maxMana: number;
  baseArmor: number;
  baseDamage: number;
  maxStamina: number;
  baseIntelligence: number;
  holyBlessings: number;
}

interface UnlockAbility<FromItem extends boolean = false> {
  availableLevel: number;
  maxEvolve: number;
  itemId: FromItem extends true ? number : undefined;
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
  baseMaxStamina: number;
  availableAbilities: UnlockAbility[];
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

export interface AbilitiesFile {
  DevDesc: string;
  parentId: number;
  damage: number;
  heal: number;
  cost: number;
  unlockCost: number;
  boostPerLevel: PerLevelBoost;
}
