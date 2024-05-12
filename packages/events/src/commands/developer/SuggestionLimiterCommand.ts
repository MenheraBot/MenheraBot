import { ApplicationCommandOptionTypes, ButtonStyles, TextStyles } from 'discordeno/types';
import { User } from 'discordeno/transformers';

import { createCommand } from '../../structures/command/createCommand';
import suggestionLimitRepository from '../../database/repositories/suggestionLimitRepository';
import {
  createActionRow,
  createButton,
  createCustomId,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { getDisplayName } from '../../utils/discord/userUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { ModalInteraction } from '../../types/interaction';
import { extractFields } from '../../utils/discord/modalUtils';

const executeLimitComponents = async (
  ctx: ComponentInteractionContext<ModalInteraction>,
): Promise<void> => {
  const [action, userId, create] = ctx.sentData;

  if (action === 'FREE') {
    await suggestionLimitRepository.freeUser(userId);
    return ctx.makeMessage({ content: 'Sereno', embeds: [], components: [] });
  }

  if (action === 'LIMIT')
    return ctx.respondWithModal({
      title: 'Limitar o maninho',
      customId: createCustomId(0, ctx.user.id, ctx.originalInteractionId, 'MODAL', userId, create),
      components: [
        createActionRow([
          createTextInput({
            customId: 'MOTIVO',
            label: 'Bota a sugestão que ele mando',
            style: TextStyles.Paragraph,
            minLength: 10,
            maxLength: 3900,
            required: true,
          }),
        ]),
      ],
    });

  const suggestion = extractFields(ctx.interaction)[0].value;

  await suggestionLimitRepository.limitUser(userId, suggestion, create === 'true');

  ctx.makeMessage({
    content: 'Limitado!',
    components: [],
    embeds: [],
  });
};

const BlacklistCommand = createCommand({
  path: '',
  name: 'suggest_limit',
  description: '[DEV] Manipula os block de sugestão',
  options: [
    {
      type: ApplicationCommandOptionTypes.User,
      name: 'user',
      description: 'User',
      required: true,
    },
  ],
  devsOnly: true,
  category: 'dev',
  authorDataFields: ['selectedColor'],
  commandRelatedExecutions: [executeLimitComponents],
  execute: async (ctx, finishCommand) => {
    finishCommand();
    const user = ctx.getOption<User>('user', 'users', true);

    const suggestionLimit = await suggestionLimitRepository.getLimitData(user.id);

    const limitButton = createButton({
      label: 'Limitar sugestões',
      style: ButtonStyles.Danger,
      customId: createCustomId(
        0,
        ctx.user.id,
        ctx.originalInteractionId,
        'LIMIT',
        user.id,
        suggestionLimit === null,
      ),
    });

    const freeButton = createButton({
      label: 'Liberar user',
      style: ButtonStyles.Primary,
      customId: createCustomId(
        0,
        ctx.user.id,
        ctx.originalInteractionId,
        'FREE',
        user.id,
        suggestionLimit === null,
      ),
    });

    if (!suggestionLimit)
      return ctx.makeMessage({
        content: `${getDisplayName(user)} [${user.username} - ${
          user.id
        }] nunca foi limitado de enviar sugestões`,
        flags: MessageFlags.EPHEMERAL,
        components: [createActionRow([limitButton])],
      });

    const embed = createEmbed({
      title: 'Sugestão:',
      fields: [
        {
          name: 'Usuário',
          value: `${getDisplayName(user)} [${user.username} - ${user.id}]`,
          inline: true,
        },
        {
          name: 'Data do limite',
          value: `${new Date(suggestionLimit.limitedAt)}`,
          inline: true,
        },
        {
          name: 'Limitado atualmente',
          value: `${suggestionLimit.limited}`,
          inline: true,
        },
      ],
      description: suggestionLimit.suggestion,
      color: hexStringToNumber(ctx.authorData.selectedColor),
    });

    ctx.makeMessage({
      embeds: [embed],
      flags: MessageFlags.EPHEMERAL,
      components: [createActionRow([limitButton, freeButton])],
    });
  },
});

export default BlacklistCommand;
