export interface IAbility {
  id: number;
  level: number;
  xp: number;
  xpToUp: number;
}

export interface IArmor {
  head: number;
  chest: number;
  pants: number;
  boots: number;
}

export interface IEquiped {
  weapon: number;
  armor: IArmor;
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
  maxLife: number;
  maxMana: number;
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilitySkill: number;
  abilities: Array<IAbility>;
  inventory: number[];
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
  name: string;
  baseAttributesPerLevel: IAttributesPerLevel;
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
