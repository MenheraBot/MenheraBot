import { ButtonStyles } from 'discordeno/types';
import { GenericContext, InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import { InBattleEnemy, InBattleUser, PlayerVsEnviroment } from './types';
import { getStatusDisplayFields } from './statusDisplay';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { extractBattleUserInfoToCharacter } from './battle/battleUtils';
import { DatabaseCharacterSchema } from '../../types/database';
import battleRepository from '../../database/repositories/battleRepository';

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

const finishAdventure = async (
  ctx: GenericContext,
  adventure: PlayerVsEnviroment,
  content: string,
  aditionalQuery: Partial<DatabaseCharacterSchema> = {},
): Promise<void> => {
  battleRepository.deleteAdventure(adventure.id);
  battleRepository.removeUserInBattle(adventure.user.id);

  await roleplayRepository.updateCharacter(adventure.user.id, {
    ...extractBattleUserInfoToCharacter(adventure.user),
    ...aditionalQuery,
  });

  ctx.makeMessage({ content, embeds: [], components: [] });
};

export { confirmAdventure, finishAdventure };
