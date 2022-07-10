import {
  AbilityEffect,
  BattleUserTurn,
  ReadyToBattleEnemy,
  UserAbility,
  UserBattleEntity,
} from '@roleplay/Types';
import {
  calculateEffectiveDamage,
  calculateHeal,
  didUserHit,
  getAbilityCost,
  getEnemyStatusWithEffects,
  getUserIntelligence,
  getUserMaxLife,
} from './Calculations';
import { getAbilityById, getClassById } from './DataUtils';

export const addAbilityCooldown = (ability: UserAbility, user: UserBattleEntity): void => {
  const found = user.abilitiesCooldowns.find((a) => a.id === ability.id);

  const parsedAbility = getAbilityById(ability.id);

  if (found) {
    found.cooldown = parsedAbility.data.cooldown;
  } else {
    user.abilitiesCooldowns.push({ id: ability.id, cooldown: parsedAbility.data.cooldown });
  }
};

export const canUserUseAbility = (ability: UserAbility, user: UserBattleEntity): boolean => {
  const hasMana = user.mana >= getAbilityCost(ability);

  const found = user.abilitiesCooldowns.find((a) => a.id === ability.id);

  if (!found) return hasMana;

  return hasMana && found.cooldown <= 0;
};
export const invertBattleTurn = (lastTurn: BattleUserTurn): BattleUserTurn =>
  lastTurn === 'attacker' ? 'defender' : 'attacker';

export const getAbilityDamageFromEffects = (
  effects: AbilityEffect[],
  userIntelligence: number,
  abilityLevel: number,
): number =>
  effects.reduce((p, c) => {
    if (c.effectType === 'damage') {
      const abilityDamage = Math.floor(
        c.effectValue +
          userIntelligence * (c.effectValueByIntelligence / 100) +
          c.effectValuePerLevel * abilityLevel,
      );

      return p + abilityDamage;
    }

    return p;
  }, 0);

export const isDead = (entity: { life: number }): boolean => entity.life <= 0;

export const executeAlliesAbilityEffect = (
  effect: AbilityEffect,
  user: UserBattleEntity,
  userIndex: number,
  abilityLevel: number,
  alliesToEffect: UserBattleEntity[],
): void => {
  if (effect.durationInTurns === -1) {
    // The only Self Effect that has -1 duration is the Heal Effect
    alliesToEffect.forEach((ally) => {
      ally.life = Math.min(
        getUserMaxLife(ally),
        ally.life +
          calculateHeal(user, {
            ...effect,
            level: abilityLevel,
            author: {
              indexInBattle: userIndex,
              totalIntelligence: getUserIntelligence(user),
              elementSinergy: getClassById(user.class).data.elementSinergy,
            },
          }),
      );
    });
    return;
  }

  alliesToEffect.forEach((ally) => {
    ally.effects.push({
      ...effect,
      level: abilityLevel,
      author: {
        indexInBattle: userIndex,
        totalIntelligence: getUserIntelligence(user),
        elementSinergy: getClassById(user.class).data.elementSinergy,
      },
    });
  });
};

export const executeEnemiesAbilityEffect = (
  effect: AbilityEffect,
  user: UserBattleEntity,
  userIndex: number,
  abilityLevel: number,
  enemiesToEffect: ReadyToBattleEnemy[],
  userAttackSuccess: number,
): void => {
  if (effect.effectType === 'damage') {
    const abilityDamage = Math.floor(
      effect.effectValue +
        getUserIntelligence(user) * (effect.effectValueByIntelligence / 100) +
        effect.effectValuePerLevel * abilityLevel,
    );

    enemiesToEffect.forEach((enemy) => {
      const didConnect = didUserHit(userAttackSuccess);

      if (didConnect)
        enemy.life = Math.max(
          0,
          enemy.life -
            calculateEffectiveDamage(abilityDamage, 0, getEnemyStatusWithEffects(enemy, 'armor')),
        );
    });
    return;
  }

  if (effect.durationInTurns > 0) {
    enemiesToEffect.forEach((enemy) => {
      enemy.effects.push({
        ...effect,
        level: abilityLevel,
        author: {
          indexInBattle: userIndex,
          totalIntelligence: getUserIntelligence(user),
          elementSinergy: getClassById(user.class).data.elementSinergy,
        },
      });
    });
  }
};
