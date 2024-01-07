import { InteractionContext } from '../../../types/menhera';
import { PlayerVsEnviroment } from '../types';

const executeEnemyAttack = (_ctx: InteractionContext, adventure: PlayerVsEnviroment): void => {
  adventure.user.life -= adventure.enemy.damage;
};

export { executeEnemyAttack };
