import { ButtonStyles } from 'discordeno/types';
import { Embed } from 'discordeno/transformers';
import { GenericContext, InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import {
  BattleTimerActionType,
  Enemy,
  InBattleEnemy,
  InBattleUser,
  PlayerVsEnviroment,
} from './types';
import { getStatusDisplayFields } from './statusDisplay';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { extractBattleUserInfoToCharacter } from './battle/battleUtils';
import { DatabaseCharacterSchema } from '../../types/database';
import battleRepository from '../../database/repositories/battleRepository';
import { prepareEnemyToBattle, prepareUserToBattle, setupAdventurePvE } from './devUtils';
import { clearBattleTimer, startBattleTimer } from './battle/battleTimers';
import { displayBattleControlMessage } from './battle/displayBattleState';
import { minutesToMillis } from '../../utils/miscUtils';
import { MINUTES_TO_FORCE_FINISH_BATTLE } from './constants';

const confirmAdventure = async (
  ctx: InteractionContext,
  user: InBattleUser,
  enemy: InBattleEnemy,
): Promise<void> => {
  const embed = createEmbed({
    title: 'Entrar na batalha?',
    fields: getStatusDisplayFields(user, enemy),
  });

  const confirmButton = createButton({
    label: 'Lutar',
    style: ButtonStyles.Success,
    customId: createCustomId(0, ctx.user.id, ctx.commandId, 'JOIN_DUNGEON'),
  });

  ctx.makeMessage({
    content: `${mentionUser(ctx.user.id)}`,
    allowedMentions: { users: [ctx.user.id] },
    embeds: [embed],
    components: [createActionRow([confirmButton])],
  });
};

const startAdventure = async (
  ctx: GenericContext,
  character: DatabaseCharacterSchema,
  enemy: Enemy,
): Promise<void> => {
  const adventure = setupAdventurePvE(
    ctx,
    prepareUserToBattle(character),
    prepareEnemyToBattle(enemy, 1),
  );

  await Promise.all([
    roleplayRepository.decreaseEnemyFromArea(character.location),
    battleRepository.setUserInBattle(character.id),
    battleRepository.setAdventure(`${character.id}`, adventure),
  ]);

  startBattleTimer(`finish_battle:${adventure.id}`, {
    battleId: adventure.id,
    executeAt: Date.now() + minutesToMillis(MINUTES_TO_FORCE_FINISH_BATTLE),
    type: BattleTimerActionType.FORCE_FINISH_BATTLE,
  });

  displayBattleControlMessage(ctx, adventure);
};

const finishAdventure = async (
  ctx: GenericContext,
  adventure: PlayerVsEnviroment,
  embeds: Embed[],
  aditionalQuery: Partial<DatabaseCharacterSchema> = {},
): Promise<void> => {
  battleRepository.deleteAdventure(adventure.id);
  battleRepository.removeUserInBattle(adventure.user.id);
  clearBattleTimer(`finish_battle:${adventure.id}`);

  await roleplayRepository.updateCharacter(adventure.user.id, {
    ...extractBattleUserInfoToCharacter(adventure.user),
    ...aditionalQuery,
  });

  ctx.makeMessage({ embeds, components: [] });
};

export { confirmAdventure, finishAdventure, startAdventure };
