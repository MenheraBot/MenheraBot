import { InteractionContext } from '../../../types/menhera';
import { PlayerVsEnviroment } from '../types';
import { keepNumbersPositive } from './battleUtils';

const executeEnemyAttack = (_ctx: InteractionContext, adventure: PlayerVsEnviroment): void => {
  adventure.user.life -= adventure.enemy.damage;

  keepNumbersPositive(adventure.enemy);
  keepNumbersPositive(adventure.user);
};

export { executeEnemyAttack };
