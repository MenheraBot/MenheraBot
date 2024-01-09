import { PlayerVsEnviroment } from '../types';
import { keepNumbersPositive } from './battleUtils';

const executeEnemyAttack = async (adventure: PlayerVsEnviroment): Promise<void> => {
  adventure.user.life -= adventure.enemy.damage;

  keepNumbersPositive(adventure.enemy);
  keepNumbersPositive(adventure.user);
};

export { executeEnemyAttack };
