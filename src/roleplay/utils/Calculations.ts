import { RoleplayUserSchema, UserAbility } from '@roleplay/Types';
import { ToBLess } from '@utils/Types';
import { getAbilityById, getClassById, getRaceById } from './DataUtils';

export const getUserMaxLife = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('life', user.blesses.maxLife);

  const classLife =
    userClass.data.baseMaxLife + userClass.data.attributesPerLevel.maxLife * user.level;

  const raceLife = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'maxLife' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  return classLife + raceLife + userBlesses;
};

export const getUserMaxMana = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('mana', user.blesses.maxMana);

  const classMana =
    userClass.data.baseMaxMana + userClass.data.attributesPerLevel.maxMana * user.level;

  const raceMana = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'maxMana' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  return classMana + raceMana + userBlesses;
};

export const getUserDamage = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('damage', user.blesses.damage);

  const classDamage =
    userClass.data.baseDamage + userClass.data.attributesPerLevel.baseDamage * user.level;

  const raceDamage = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'baseDamage' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  return classDamage + raceDamage + userBlesses;
};

export const getUserArmor = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('armor', user.blesses.armor);

  const classArmor =
    userClass.data.baseArmor + userClass.data.attributesPerLevel.baseArmor * user.level;

  const raceArmor = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'baseArmor' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  return classArmor + raceArmor + userBlesses;
};

export const getUserIntelligence = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('intelligence', user.blesses.intelligence);

  const classIntelligence =
    userClass.data.baseIntelligence +
    userClass.data.attributesPerLevel.baseIntelligence * user.level;

  const raceIntellience = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'baseIntelligence' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  return classIntelligence + raceIntellience + userBlesses;
};

export const calculateEffectiveDamage = (totalDamage: number, enemyArmor: number): number =>
  Math.floor(totalDamage * (100 / (100 + enemyArmor)));

export const makeBlessingStatusUpgrade = (toBless: ToBLess, points: number): number => {
  switch (toBless) {
    case 'life':
      return points * 50;
    case 'mana':
      return points * 10;
    case 'intelligence':
      return points * 10;
    case 'armor':
      return points * 4;
    case 'damage':
      return points * 5;
  }
};

export const getAbilityNextLevelBlessings = (abilityLevel: number): number => {
  const toNext: { [level: number]: number } = {
    0: 1,
    1: 5,
    2: 15,
    3: 30,
    4: 60,
    5: 100,
  };

  return toNext[abilityLevel];
};

export const getAbilityDamage = (ability: UserAbility, userIntelligence: number): number => {
  const resolvedAbility = getAbilityById(ability.id);

  const baseDamage =
    resolvedAbility.data.damage.base + resolvedAbility.data.boostPerLevel.damage * ability.level;
  const scaleDamage = (resolvedAbility.data.damage.scale / 100) * userIntelligence;

  return Math.floor(baseDamage + scaleDamage);
};

export const getAbilityHeal = (ability: UserAbility, userIntelligence: number): number => {
  const resolvedAbility = getAbilityById(ability.id);

  if (resolvedAbility.data.heal.base === 0) return 0;

  const baseHeal =
    resolvedAbility.data.heal.base + resolvedAbility.data.boostPerLevel.heal * ability.level;
  const scaleHeal = (resolvedAbility.data.heal.scale / 100) * userIntelligence;

  return Math.floor(baseHeal + scaleHeal);
};

export const getAbilityCost = (ability: UserAbility): number => {
  const resolvedAbility = getAbilityById(ability.id);

  return Math.floor(
    resolvedAbility.data.cost + resolvedAbility.data.boostPerLevel.cost * ability.level,
  );
};
