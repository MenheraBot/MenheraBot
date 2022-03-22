import {
  BASE_XP,
  DIFFICULT_TO_LEVEL_UP,
  ELEMENT_SINERGY_BONUS_IN_PERCENTAGE,
} from '@roleplay/Constants';
import {
  ProtectionItem,
  ReadyToBattleEnemy,
  UserAbility,
  UserBattleEntity,
  WeaponItem,
} from '@roleplay/Types';
import { ToBLess } from '@utils/Types';
import { getAbilityById, getClassById, getItemById, getRaceById } from './DataUtils';

export const getEnemyStatusWithEffects = (
  enemy: ReadyToBattleEnemy,
  wannedStatus: 'agility' | 'armor' | 'damage',
  user: UserBattleEntity,
): number => {
  const userClass = getClassById(user.class);
  const baseStatus = enemy[wannedStatus];

  const effects = enemy.effects.reduce((p, c) => {
    if (!c.effectType.startsWith(wannedStatus)) return p;
    let effectValue =
      c.effectValue +
      getUserIntelligence(user) * (c.effectValueByIntelligence / 100) +
      c.effectValuePerLevel * c.level;

    if (c.element === userClass.data.elementSinergy)
      effectValue += effectValue * (ELEMENT_SINERGY_BONUS_IN_PERCENTAGE / 100);

    if (c.effectValueModifier === 'percentage') effectValue = baseStatus * (effectValue / 100);

    if (c.effectType.endsWith('debuff')) return p - effectValue;
    return p + effectValue;
  }, 0);

  return Math.floor(baseStatus + effects);
};

export const getUserMaxLife = (
  user: Pick<UserBattleEntity, 'class' | 'race' | 'blesses' | 'level'>,
): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('life', user.blesses.maxLife);

  const classLife = userClass.data.maxLife + userClass.data.attributesPerLevel.maxLife * user.level;

  const raceLife = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'maxLife' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  return Math.floor(classLife + raceLife + userBlesses);
};

export const getUserMaxMana = (
  user: Pick<UserBattleEntity, 'class' | 'race' | 'blesses' | 'level'>,
): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('mana', user.blesses.maxMana);

  const classMana = userClass.data.maxMana + userClass.data.attributesPerLevel.maxMana * user.level;

  const raceMana = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'maxMana' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  return Math.floor(classMana + raceMana + userBlesses);
};

const resolveEffects = (
  effects: UserBattleEntity['effects'],
  baseValue: number,
  wannedStatus: 'intelligence' | 'damage' | 'agility' | 'armor',
): number =>
  effects.reduce((p, c) => {
    if (!c.effectType.startsWith(wannedStatus)) return p;

    let effectValue =
      c.effectValue +
      c.author.totalIntelligence * (c.effectValueByIntelligence / 100) +
      c.effectValuePerLevel * c.level;

    if (c.element === c.author.elementSinergy)
      effectValue += effectValue * (ELEMENT_SINERGY_BONUS_IN_PERCENTAGE / 100);

    if (c.effectValueModifier === 'percentage') effectValue = baseValue * (effectValue / 100);

    if (c.effectType.endsWith('debuff')) return p - effectValue;
    return p + effectValue;
  }, 0);

export const getUserDamage = (
  user: Pick<UserBattleEntity, 'class' | 'race' | 'blesses' | 'level' | 'effects' | 'weapon'>,
): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('damage', user.blesses.damage);
  const userWeapon = getItemById<WeaponItem>(user.weapon.id);

  const classDamage =
    userClass.data.baseDamage + userClass.data.attributesPerLevel.baseDamage * user.level;

  const raceDamage = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'baseDamage' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  const weaponDamage = userWeapon.data.damage + userWeapon.data.perLevel * user.weapon.level;

  const baseDamage = classDamage + raceDamage + userBlesses + weaponDamage;

  const userEffects = resolveEffects(user.effects, baseDamage, 'damage');

  return Math.floor(baseDamage + userEffects);
};

export const getUserArmor = (
  user: Pick<UserBattleEntity, 'class' | 'race' | 'blesses' | 'level' | 'effects' | 'protection'>,
): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('armor', user.blesses.armor);
  const userProtection = getItemById<ProtectionItem>(user.protection.id);

  const classArmor =
    userClass.data.baseArmor + userClass.data.attributesPerLevel.baseArmor * user.level;

  const raceArmor = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'baseArmor' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  const protectionArmor =
    userProtection.data.armor + userProtection.data.perLevel * user.protection.level;

  const baseArmor = classArmor + raceArmor + userBlesses + protectionArmor;

  const userEffects = resolveEffects(user.effects, baseArmor, 'armor');

  return Math.floor(baseArmor + userEffects);
};

export const getUserIntelligence = (
  user: Pick<UserBattleEntity, 'class' | 'race' | 'blesses' | 'level' | 'effects'>,
): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('intelligence', user.blesses.intelligence);

  const classIntelligence =
    userClass.data.baseIntelligence +
    userClass.data.attributesPerLevel.baseIntelligence * user.level;

  const raceIntelligence = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'baseIntelligence' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  const baseIntelligence = classIntelligence + raceIntelligence + userBlesses;

  const userEffects = resolveEffects(user.effects, baseIntelligence, 'intelligence');

  return Math.floor(baseIntelligence + userEffects);
};

export const getUserAgility = (
  user: Pick<UserBattleEntity, 'class' | 'race' | 'blesses' | 'level' | 'effects'>,
): number => {
  const userClass = getClassById(user.class);
  const userRace = getRaceById(user.race);
  const userBlesses = makeBlessingStatusUpgrade('agility', user.blesses.agility);
  const classAgility =
    userClass.data.baseAgility + userClass.data.attributesPerLevel.baseAgility * user.level;

  const raceAgility = userRace.data.facilities.reduce(
    (p, c) => (c.facility === 'baseAgility' ? p + c.boostPerLevel * user.level : 0),
    0,
  );

  const baseAgility = classAgility + raceAgility + userBlesses;

  const userEffects = resolveEffects(user.effects, baseAgility, 'agility');

  return Math.floor(baseAgility + userEffects);
};

export const calculateHeal = (
  user: UserBattleEntity,
  healEffect: UserBattleEntity['effects'][number],
): number => {
  let effectValue =
    healEffect.effectValue +
    healEffect.author.totalIntelligence * (healEffect.effectValueByIntelligence / 100) +
    healEffect.effectValuePerLevel * healEffect.level;

  if (healEffect.element === healEffect.author.elementSinergy)
    effectValue += effectValue * (ELEMENT_SINERGY_BONUS_IN_PERCENTAGE / 100);

  if (healEffect.effectValueModifier === 'percentage')
    effectValue = getUserMaxLife(user) * (effectValue / 100);

  return Math.floor(effectValue);
};

export const calculatePoison = (
  poisonEffect: UserBattleEntity['effects'][number],
  enemyLife: number,
): number => {
  let effectValue =
    poisonEffect.effectValue +
    poisonEffect.author.totalIntelligence * (poisonEffect.effectValueByIntelligence / 100) +
    poisonEffect.effectValuePerLevel * poisonEffect.level;

  if (poisonEffect.element === poisonEffect.author.elementSinergy)
    effectValue += effectValue * (ELEMENT_SINERGY_BONUS_IN_PERCENTAGE / 100);

  if (poisonEffect.effectValueModifier === 'percentage')
    effectValue = enemyLife * (effectValue / 100);

  return Math.floor(effectValue);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const calculateUserPenetration = (user: UserBattleEntity): number => 0;

export const calculateRunawaySuccess = (userAgility: number, enemyAgility: number): number => {
  const agilityDiff = Math.max((enemyAgility - userAgility) / 100, 0);
  const sigmoid = 60 / (1 + Math.E ** -agilityDiff);

  return sigmoid;
};

export const calculateDodge = (userAgility: number, enemyAgility: number): number => {
  const agilityDiff = Math.max((userAgility - enemyAgility) / 100, 0);
  const sigmoid = 20 / (1 + Math.E ** -agilityDiff);

  return sigmoid;
};

export const didUserDodged = (chance: number): boolean => {
  const randomValue = Math.random() * 100;

  return randomValue < chance;
};

export const calculateAttackSuccess = (userAgility: number, enemyAgility: number): number => {
  const agilityDiff = Math.max((enemyAgility - userAgility) / 100, 0);
  const sigmoid = 30 / (1 + Math.E ** -agilityDiff);

  return sigmoid;
};

export const didUserHit = (chance: number): boolean => {
  const randomValue = Math.random() * 100;

  return randomValue > chance;
};

export const calculateEffectiveDamage = (
  attackerDamage: number,
  attackerPenetration: number,
  defenderArmor: number,
): number =>
  // Reference: https://www.reddit.com/r/gamedesign/comments/2dyd99/question_armor_calculation_for_rpgs/
  Math.floor(
    attackerDamage -
      (attackerDamage *
        Math.max(defenderArmor * (1 - attackerPenetration / 100), 0) ** (1 / 1.33)) /
        100,
  );

export const makeBlessingStatusUpgrade = (toBless: ToBLess, points: number): number => {
  switch (toBless) {
    case 'life':
      return points * 20;
    case 'mana':
      return points * 10;
    case 'intelligence':
      return points * 7;
    case 'armor':
      return points * 5;
    case 'damage':
      return points * 6;
    case 'agility':
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

export const nextLevelXp = (userLevel: number): number =>
  Math.floor(BASE_XP * userLevel ** DIFFICULT_TO_LEVEL_UP);

export const getAbilityCost = (ability: UserAbility): number => {
  const resolvedAbility = getAbilityById(ability.id);

  return Math.floor(resolvedAbility.data.cost + resolvedAbility.data.costPerLevel * ability.level);
};
