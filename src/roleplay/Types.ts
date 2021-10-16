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

export type TEffectTarget = 'self' | 'allies' | 'enemies' | 'enemy';

export type TEffectType =
  | 'invisibility'
  | 'poison'
  | 'attack'
  | 'armor_buff'
  | 'life_buff'
  | 'mana_buff'
  | 'damage_buff'
  | 'vampirism'
  | 'degradation'
  | 'confusion'
  | 'heal'
  | 'mana'
  | 'blind';

export interface IEffectData {
  type: TEffectType;
  target: TEffectTarget;
  value: number;
  cumulative: boolean;
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
  lucky: number;
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
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilitySkill: number;
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

export type TElements = 'light' | 'darkness' | 'fire' | 'nature' | 'gravity' | 'prisma';

export interface IClassesFile {
  name: RpgClassNames;
  afinity: TElements;
  baseAttributesPerLevel: IAttributesPerLevel;
  baseMana: number;
  baseLife: number;
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilitySkill: number;
  availableWeapons: TWeapons[];
  availableArmors: TArmors[];
}

export interface IAbilityEffect {
  target: TEffectTarget;
  type: TEffectType;
  value?: number;
  isValuePercentage?: boolean;
  turns?: number;
  cumulative?: boolean;
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
  attackSkill: number;
  abilitySkill: number;
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

export type TBattleUsableItemType = 'potion';

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
  effects: IEffectData[];
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
  cumulative?: boolean;
}

export interface IMobAttacksFile {
  id: number;
  description?: string;
  element: TElements;
  effects: Array<IMobAttackEffect>;
}

export interface IMobAttributePerLevel {
  baseLife: number;
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
  baseArmor: number;
  baseDamage: number;
  baseSkill: number;
  perLevel: IMobAttributePerLevel;
  availableAttacks: number[];
}

export interface IBattleEntityEffect {
  type: TEffectType;
  value: number;
  isValuePercentage: boolean;
  turns: number;
  cumulative: boolean;
  wasExecuted: boolean;
}

export interface IAbilityResolved {
  id: number;
  cost: number;
  element: TElements;
  turnsCooldown: number;
  randomChoice: boolean;
  effects: Array<IAbilityEffect>;
  level: number;
  inCooldown: number;
}

export interface IResolvedWeapon {
  damage: number;
  effect: IEffectData[];
}

interface ResolveArmor {
  armor: number;
  effect: IEffectData[];
}

export interface IResolvedArmor {
  boots?: ResolveArmor;
  chest?: ResolveArmor;
  pants?: ResolveArmor;
  head?: ResolveArmor;
}

export interface IResolvedQuest {
  id: number;
  objective: { type: TQuestObjectiveType; value: number };
  progress: number;
}

export interface IResolvedBattleInventory {
  id: number;
  level: number;
  type: TBattleUsableItemType;
  data: IItemData;
  effects: IEffectData[];
  amount: number;
}

export interface IBattleUser {
  readonly id: string;
  life: number;
  mana: number;
  tiredness: number;
  lucky: number;
  armor: number;
  damage: number;
  attackSkill: number;
  abilitySkill: number;
  weapon: IResolvedWeapon | null;
  inventory: IResolvedBattleInventory[];
  abilities: Array<IAbilityResolved>;
  afinity: TElements;
  effects: IBattleEntityEffect[];
  isUser: true;
  quests: IResolvedQuest[];
}
export interface IBattleMob {
  readonly name: string;
  life: number;
  armor: number;
  damage: number;
  attackSkill: number;
  attacks: IMobAttacksFile[];
  effects: IBattleEntityEffect[];
  isUser: false;
}

export type TBattleEntity = IBattleMob | IBattleUser;

export interface IReturnData<T> {
  id: number;
  data: T;
}

export interface IBasicAttack {
  type: 'basic';
  damage: number;
}

export interface IResolvedAbilityEffect {
  target: TEffectTarget;
  type: TEffectType;
  value: number;
  isValuePercentage: boolean;
  turns: number;
  cumulative: boolean;
}

export interface IAbilityAttack {
  type: 'ability';
  id: number;
  level: number;
  effects: IResolvedAbilityEffect[];
}

export interface IInventoryAttack {
  type: 'inventory';
  id: number;
  level: number;
  effects: IEffectData[];
}

export type TBattleTurn = IBasicAttack | IAbilityAttack | IInventoryAttack;
