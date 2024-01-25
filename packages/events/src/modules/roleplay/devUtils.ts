import { DatabaseCharacterSchema } from '../../types/database';
import { InteractionContext } from '../../types/menhera';
import { logger } from '../../utils/logger';
import { Enemy, InBattleEnemy, InBattleUser, PlayerVsEnviroment } from './types';

export const createDummyEnemy = (): InBattleEnemy => ({
  id: 1,
  damage: 59,
  life: 100,
  level: 1,
  $devName: 'Goblin',
  effects: [],
});

export const prepareEnemyToBattle = (enemy: Enemy, level: number): InBattleEnemy => ({
  id: enemy.id,
  $devName: enemy.$devName,
  damage: enemy.damage[level - 1],
  life: enemy.life[level - 1],
  effects: [],
  level,
});

export const prepareUserToBattle = (user: DatabaseCharacterSchema): InBattleUser => ({
  id: user.id,
  life: user.life,
  energy: user.energy,
  damage: 23,
  effects: [],
  inventory: user.inventory,
  abilitites: user.abilities,
});

export const setupAdventurePvE = (
  ctx: InteractionContext,
  user: InBattleUser,
  enemy: InBattleEnemy,
): PlayerVsEnviroment => ({
  enemy,
  id: `${ctx.user.id}`,
  user,
  interactionToken: ctx.interaction.token,
  language: ctx.guildLocale,
});

export const unknownAdventure = (ctx: InteractionContext): void => {
  logger.debug('Didnt found an adventure for user ID', ctx.user.id);

  ctx.makeMessage({
    components: [],
    embeds: [],
    attachments: [],
    content: 'Essa aventura não foi encontrada',
  });
};
