import { ButtonStyles } from 'discordeno/types';
import { InteractionContext } from '../../types/menhera';
import { createActionRow, createButton, createCustomId } from '../../utils/discord/componentUtils';
import { createEmbed } from '../../utils/discord/embedUtils';
import { mentionUser } from '../../utils/discord/userUtils';
import { InBattleEnemy, InBattleUser } from './types';
import { getStatusDisplayFields } from './statusDisplay';
import { createDummyEnemy } from './devUtils';

const getCurrentAvailableAdventure = (): InBattleEnemy | null => {
  return createDummyEnemy();
};

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

export { confirmAdventure, getCurrentAvailableAdventure };
