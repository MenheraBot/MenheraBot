import classes from './data/Classes';

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

export interface IInHand {
  weapon: number;
  armor: IArmor;
}

export type ClassType = keyof typeof classes;

export interface IRpgUserSchema {
  readonly id: string;
  classId: ClassType;
  raceId: number;
  speed: number;
  regionId: number;
  locationId: number;
  level: number;
  xp: number;
  life: number;
  mana: number;
  tiredness: number;
  maxLife: number;
  maxMana: number;
  baseArmor: number;
  baseDamage: number;
  attackSkill: number;
  abilitySkill: number;
  abilityPower: number;
  abilities: Array<IAbility>;
  inventory: number[];
  inHand: IInHand;
  clanId: number;
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
