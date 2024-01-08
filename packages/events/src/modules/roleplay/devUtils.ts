import { DatabaseCharacterSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { logger } from '../../utils/logger';
import { InBattleEnemy, InBattleUser, PlayerVsEnviroment } from './types';

export const createDummyEnemy = (): InBattleEnemy => ({
  id: 1,
  damage: 40,
  life: 100,
  level: 1,
  $devName: 'Goblin',
});

export const prepareUserToBattle = (user: DatabaseCharacterSchema): InBattleUser => ({
  id: user.id,
  life: user.life,
  energy: user.energy,
  damage: 80,
});

export const setupAdventurePvE = (
  ctx: InteractionContext,
  user: InBattleUser,
  enemy: InBattleEnemy,
): PlayerVsEnviroment => ({ enemy, id: `${ctx.user.id}`, user });

export const unknownAdventure = (ctx: InteractionContext): void => {
  logger.debug('Didnt found an adventure for user ID', ctx.user.id);

  ctx.makeMessage({
    components: [],
    embeds: [],
    attachments: [],
    content: 'Essa aventura não foi encontrada',
  });
};
