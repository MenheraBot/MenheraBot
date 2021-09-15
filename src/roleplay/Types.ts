import InteractionCommandContext from '@structures/command/InteractionContext';
import { RpgClassNames } from '@structures/MenheraConstants';

export interface IAbility {
  id: number;
  level: number;
  xp: number;
}

export interface IInventoryItem {
  id: number;
  amount: number;
  level?: number;
}

export interface ILeveledItem {
  id: number;
  level: number;
}

export interface IArmor {
  head?: ILeveledItem;
  chest?: ILeveledItem;
  pants?: ILeveledItem;
  boots?: ILeveledItem;
}

export interface IEquiped {
  weapon?: ILeveledItem;
  armor: IArmor;
  backpack: ILeveledItem;
}

export interface IMoney {
  gold: number;
  silver: number;
  bronze: number;
}

export interface IQuest {
  id: number;
  level: number;
  progress: number;
  finished: boolean;
  claimed: boolean;
}

export interface IUserQuests {
  available: Array<IQuest>;
  active?: IQuest;
}

export interface IJob {
  id: number;
  level: number;
  xp: number;
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
  homes: string[]; // Array of HomeID
  quests: IUserQuests;
  clanId: number | null;
}
export interface IHomeSchema {
  ownerId: string;
  locationId: number;
  isClanHome: boolean;
  name: string;
  inventory: Array<IInventoryItem>;
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
  | 'mana'
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
  description?: string;
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
  equiped: IEquiped;
}

export interface IBuildingFile {
  name: string;
  locationId: number;
  minLevel: number;
  execute: (ctx: InteractionCommandContext, user: IRpgUserSchema) => Promise<void>;
}

export type TItemRarity = 'common' | 'rare' | 'epic' | 'mythical' | 'legendary' | 'ascendant';

export type TArmorType = 'chest' | 'head' | 'boots' | 'pants';

export type TItemType = 'armor' | 'potion' | 'weapon' | 'drop' | 'backpack';

interface IItemData {
  value: number;
  perLevel: number;
}

export interface IUsableItem {
  price: IMoney;
  rarity: TItemRarity;
  type: TItemType;
  data: IItemData;
  helperType: TEffectType | TArmorType;
}

export interface IUnusableItem {
  price: IMoney;
  rarity: TItemRarity;
  type: TItemType;
}

export type AsAnUsableItem = true;
export type AsAnUnasableItem = false;

export type IItemFile<T extends boolean> = T extends true ? IUsableItem : IUnusableItem;

export interface IEnochiaShop {
  armors: ILeveledItem[];
  weapons: ILeveledItem[];
  potions: ILeveledItem[];
}

type TQuestObjectiveType = 'drop' | 'use_item' | 'kill_enemy';

interface IQuestObjective {
  type: TQuestObjectiveType;
  value: number;
  perLevel: number;
  amount: number;
}

interface IQuestRewardMoney {
  type: 'money';
  experience: number;
  perLevel: IMoney;
  amount: IMoney;
}

interface IQuestRewardItem {
  type: 'item';
  experience: number;
  perLevel: number;
  amount: number;
  value: ILeveledItem;
}

export interface IQuestsFile {
  description?: string;
  minUserLevel: number;
  maxUserLevel?: number;
  objective: IQuestObjective;
  isDaily: boolean;
  reward: IQuestRewardMoney | IQuestRewardItem;
}

export interface IUpdatedUserInfo {
  level: number;
  xp: number;
}

export interface IPartyData {
  leader: string;
  party: string[];
}

export interface IMobAttackEffect {
  type: TEffectType;
  value?: number;
  isValuePercentage?: boolean;
  turns?: number;
}

export interface IMobAttacksFile {
  description?: string;
  element: TElements;
  effects: Array<IMobAttackEffect>;
}

export interface IMobAttributePerLevel {
  baseLife: number;
  baseSpeed: number;
  baseArmor: number;
  baseDamage: number;
  baseSkill: number;
}

export interface IMobsFile {
  description?: string;
  availableLocations: number[];
  minUserLevel: number;
  isLocationBuilding: boolean;
  baseLife: number;
  baseSpeed: number;
  baseArmor: number;
  baseDamage: number;
  baseSkill: number;
  perLevel: IMobAttributePerLevel;
  availableAttacks: number[];
}
