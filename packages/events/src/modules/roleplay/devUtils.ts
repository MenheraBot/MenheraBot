import { DatabaseCharacterSchema } from '../../types/database';
import { GenericContext, InteractionContext } from '../../types/menhera';
import { logger } from '../../utils/logger';
import { Enemy } from './data/enemies';
import { InBattleEnemy, InBattleUser, PlayerVsEnviroment } from './types';

export const prepareEnemyToBattle = (enemy: Enemy): InBattleEnemy => ({
  id: enemy.id,
  damage: enemy.damage,
  life: enemy.life,
  effects: [],
});

export const prepareUserToBattle = (user: DatabaseCharacterSchema): InBattleUser => ({
  id: user.id,
  life: user.life,
  energy: user.energy,
  effects: [],
  inventory: user.inventory,
  abilitites: user.abilities,
});

export const setupAdventurePvE = (
  ctx: GenericContext,
  user: InBattleUser,
  enemy: InBattleEnemy,
): PlayerVsEnviroment => ({
  enemy,
  id: `${ctx.commandId}`,
  user,
  interactionToken: ctx.interactionToken,
  language: ctx.guildLocale,
});

export const unknownAdventure = (ctx: InteractionContext): void => {
  logger.debug('Didnt found an adventure for commandID', ctx.commandId);

  ctx.makeMessage({
    components: [],
    embeds: [],
    attachments: [],
    content: ctx.prettyResponse('error', 'commands:aventura.adventure-not-found'),
  });
};
