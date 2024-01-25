import ComponentInteractionContext from '../../../structures/command/ComponentInteractionContext';
import { Ability, PlayerVsEnviroment } from '../types';
import { keepNumbersPositive } from './battleUtils';

const executeEffects = (
  _ctx: ComponentInteractionContext,
  adventure: PlayerVsEnviroment,
  effects: Ability['effects'],
): void => {
  effects.forEach((effect) => {
    const entity = effect.applyTo === 'enemy' ? adventure.enemy : adventure.user;

    switch (effect.type) {
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
          }' is not executed in Execute Effects function. Effect and adventure: ${JSON.stringify(
            effect,
          )} --- ${JSON.stringify(adventure)}`,
        );
      }
    }

    if (effect.repeatRounds)
      entity.effects.push({
        repeatRounds: effect.repeatRounds - 1,
        type: effect.type,
        value: effect.value,
      });
  });

  keepNumbersPositive(adventure.enemy);
  keepNumbersPositive(adventure.user);
};

export { executeEffects };
