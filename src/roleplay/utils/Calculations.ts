import { ReadyToBattleEnemy, RoleplayUserSchema } from '@roleplay/Types';
import { ToBLess } from '@utils/Types';

export const getUserNextLevelXp = (level: number): number => level * 2000;

export const getUserMaxLife = (user: RoleplayUserSchema): number => user.level * 20;

export const getUserMaxMana = (user: RoleplayUserSchema): number => user.level * 20;

export const getUserDamage = (user: RoleplayUserSchema): number => user.level * 20;

export const getUserArmor = (user: RoleplayUserSchema): number => user.level * 20;

export const getUserIntelligence = (user: RoleplayUserSchema): number => user.level * 20;

export const calculateEffectiveDamage = (
  user: RoleplayUserSchema,
  enemy: ReadyToBattleEnemy,
): number => user.damage * 2 - enemy.armor;

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
