import { PlayerVsEnviroment } from '../types';

const executeEnemyAttack = async (adventure: PlayerVsEnviroment): Promise<void> => {
  adventure.user.life -= adventure.enemy.damage;
};

export { executeEnemyAttack };
