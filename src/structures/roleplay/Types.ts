import InteractionCommandContext from '@structures/command/InteractionContext';
import { RpgClassNames } from '@structures/MenheraConstants';

export interface IAbility {
  id: number;
  level: number;
  xp: number;
}

export interface ILeveledItem {
  id: number;
  level: number;
}

export interface IArmor {
  head: ILeveledItem;
  chest: ILeveledItem;
  pants: ILeveledItem;
  boots: ILeveledItem;
}

export interface IEquiped {
  weapon: ILeveledItem;
  armor: IArmor;
  backpack: ILeveledItem;
}

export interface IMoney {
  gold: number;
  silver: number;
  bronze: number;
}

interface IQuest {
  id: number;
  progress: number;
}

export interface IUserQuests {
  daily: Array<IQuest>;
  available: Array<IQuest>;
  active: IQuest;
}

export interface IJob {
  id: number;
  level: number;
  xp: number;
}

export interface IInventoryItem {
  id: number;
  amount: number;
}

export interface IRpgUserSchema {
  readonly id: string;
  classId: number;
  raceId: number;
  locationId: number;
  level: number;
  xp: number;
  life: number;
  mana: number;
  tiredness: number;
  speed: number;
  lucky: number;
  maxLife: number;
  maxMana: number;
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilitySkill: number;
  abilities: Array<IAbility>;
  inventory: Array<IInventoryItem>;
  equiped: IEquiped;
  job: IJob;
  cooldown: unknown;
  money: IMoney;
  quests: IUserQuests;
  clanId: number | null;
}

interface IAttributesPerLevel {
  maxLife: number;
  maxMana: number;
  speed: number;
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilityPower: number;
}

export type TWeapons =
  | 'mace'
  | 'chain'
  | 'bow'
  | 'sickle'
  | 'crossbow'
  | 'dagger'
  | 'knife'
  | 'grimoire'
  | 'axe'
  | 'sword'
  | 'shield'
  | 'gladius';

export type TArmors = 'light' | 'medium' | 'heavy';

export interface IClassesFile {
  name: RpgClassNames;
  baseAttributesPerLevel: IAttributesPerLevel;
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilitySkill: number;
  speed: number;
  availableWeapons: TWeapons[];
  availableArmors: TArmors[];
}

export type TEffectTarget = 'self' | 'allies' | 'enemies';

export type TEffectType =
  | 'invisibility'
  | 'poison'
  | 'slow'
  | 'attack'
  | 'speed'
  | 'armor_penetration'
  | 'armor_buff'
  | 'life_buff'
  | 'vampirism'
  | 'degradation'
  | 'confusion'
  | 'heal'
  | 'blind';

export type TElements = 'light' | 'darkness' | 'fire' | 'nature' | 'gravity' | 'prisma';

export interface IAbilityEffect {
  target: TEffectTarget;
  type: TEffectType;
  amount?: number | 'ALL';
  value?: number;
  isValuePercentage?: boolean;
  turns?: number;
}

export interface IAbilitiesFile {
  cost: number;
  element: TElements;
  turnsCooldown: number;
  randomChoice?: boolean;
  effects: Array<IAbilityEffect>;
}

export type TRaceName = 'elf' | 'goblin' | 'human' | 'orc' | 'chained' | 'saint';

export type TRaceFacilityType = 'element' | 'armor' | 'buff' | 'loot';

export interface IRaceFacility {
  type: TRaceFacilityType;
  info: TElements | 'buff' | 'rare';
  value: number;
  isPercentage: boolean;
}

export interface IRacesFiles {
  name: TRaceName;
  facility: IRaceFacility;
}

export interface IBasicData {
  id: string;
  classId: number;
  raceId: number;
  abilities: IAbility[];
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilitySkill: number;
  speed: number;
}

export interface IBuildingFile {
  name: string;
  locationId: number;
  execute: (ctx: InteractionCommandContext, user: IRpgUserSchema) => Promise<void>;
}

export type TItemRarity = 'common' | 'rare' | 'epic' | 'mythical' | 'legendary' | 'ascendant';

export type TItemType = 'armor' | 'potion' | 'weapon' | 'drop';

export interface IItemFile {
  price: IMoney;
  rarity: TItemRarity;
  type: TItemType;
  duration?: number;
  data: unknown;
  equipable: boolean;
}

export interface IEnochiaShop {
  armors: ILeveledItem[];
  weapons: ILeveledItem[];
  potions: ILeveledItem[];
}
