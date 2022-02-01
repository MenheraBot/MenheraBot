import { ReadyToBattleEnemy, RoleplayUserSchema } from '@roleplay/Types';
import { ToBLess } from '@utils/Types';
import { getClassById } from './DataUtils';

export const getUserNextLevelXp = (level: number): number => level * 10 + (level - 1 * 100);

export const getUserMaxLife = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);

  return userClass.data.baseMaxLife + userClass.data.attributesPerLevel.maxLife * user.level;
};

export const getUserMaxMana = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);

  return userClass.data.baseMaxMana + userClass.data.attributesPerLevel.maxMana * user.level;
};

export const getUserDamage = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);

  return userClass.data.baseDamage + userClass.data.attributesPerLevel.baseDamage * user.level;
};

export const getUserArmor = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);

  return userClass.data.baseArmor + userClass.data.attributesPerLevel.baseArmor * user.level;
};

export const getUserIntelligence = (user: RoleplayUserSchema): number => {
  const userClass = getClassById(user.class);

  return (
    userClass.data.baseIntelligence +
    userClass.data.attributesPerLevel.baseIntelligence * user.level
  );
};

export const calculateEffectiveDamage = (totalDamage: number, enemyArmor: number): number => 
  

export const makeBlessingStatusUpgrade = (toBless: ToBLess, points: number): number => {
  switch (toBless) {
    case 'life':
      return points * 100;
    case 'mana':
      return points * 10;
    case 'intelligence':
      return points * 3;
    case 'armor':
      return points * 2;
    case 'damage':
      return points * 3;
  }
};

export const getAbilityNextLevelBlessings = (abilityLevel: number): number => abilityLevel * 5;
