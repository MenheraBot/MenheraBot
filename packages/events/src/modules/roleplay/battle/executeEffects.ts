import { Ability, AbilityEffect, BattleEffect, BattleEntity, PlayerVsEnviroment } from '../types';

const executeEffectInEntity = (
  entity: BattleEntity,
  effect: AbilityEffect | BattleEffect,
): void => {
  switch (effect.type) {
    case 'poison':
    case 'damage': {
      entity.life -= effect.value;
      break;
    }
    case 'heal': {
      entity.life += effect.value;
      break;
    }
    default: {
      throw new Error(
        `The effect type '${
          effect.type
        }' is not executed in Execute Effects function. Effect: ${JSON.stringify(effect)}`,
      );
    }
  }
};

const executeEntitiesEffects = (adventure: PlayerVsEnviroment): void => {
  for (let i = adventure.user.effects.length - 1; i >= 0; i--) {
    const effect = adventure.user.effects[i];

    executeEffectInEntity(adventure.user, effect);
    effect.timesToApply -= 1;

    if (effect.timesToApply <= 0) adventure.user.effects.splice(i, 1);
  }

  for (let i = adventure.enemy.effects.length - 1; i >= 0; i--) {
    const effect = adventure.enemy.effects[i];

    executeEffectInEntity(adventure.enemy, effect);
    effect.timesToApply -= 1;

    if (effect.timesToApply <= 0) adventure.enemy.effects.splice(i, 1);
  }
};

const applyAbilityEffects = (adventure: PlayerVsEnviroment, effects: Ability['effects']): void => {
  effects.forEach((effect) => {
    const entity = effect.applyTo === 'enemy' ? adventure.enemy : adventure.user;

    executeEffectInEntity(entity, effect);

    if (effect.timesToApply && effect.timesToApply > 1)
      entity.effects.push({
        timesToApply: effect.timesToApply - 1,
        type: effect.type,
        value: effect.value,
      });
  });
};

export { applyAbilityEffects, executeEntitiesEffects };
