import { Interaction } from 'discordeno/transformers';
import { AllowedMentionsTypes, InteractionResponseTypes } from 'discordeno/types';
import i18next from 'i18next';

import { mentionUser } from '../../utils/discord/userUtils';
import commandRepository from '../../database/repositories/commandRepository';
import userRepository from '../../database/repositories/userRepository';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { bot } from '../../index';
import guildRepository from '../../database/repositories/guildRepository';
import ComponentInteractionContext from './ComponentInteractionContext';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getEnviroments } from '../../utils/getEnviroments';
import { ComponentInteraction } from '../../types/interaction';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

const componentExecutor = async (interaction: Interaction): Promise<void> => {
  const receivedCommandName = interaction.message?.interaction?.name;

  if (!receivedCommandName) return;
  if (!interaction.data?.customId) return;

  const [commandName] = receivedCommandName.split(' ');

  const errorReply = async (content: string): Promise<void> => {
    await bot.helpers
      .sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content: `<:negacao:759603958317711371> | ${content}`,
          flags: MessageFlags.EPHEMERAL,
          allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
        },
      })
      .catch(() => null);
  };

  const T = i18next.getFixedT(interaction.user.locale ?? 'pt-BR');
  const command = bot.commands.get(commandName);

  if (!command) return errorReply(T('permissions:UNKNOWN_SLASH'));

  if (!command.commandRelatedExecutions || command.commandRelatedExecutions.length === 0) return;

  if (bot.shuttingDown)
    return errorReply(
      'A Menhera está em processo de desligamento! Comandos estão desativados!\n\nMenhera is in the process of shutting down! Commands are disabled!',
    );

  const isUserBanned = await blacklistRepository.isUserBanned(interaction.user.id);

  if (isUserBanned) {
    const bannedInfo = await userRepository.getBannedUserInfo(interaction.user.id);

    return errorReply(
      T('permissions:BANNED_INFO', {
        banReason: bannedInfo?.banReason,
      }),
    );
  }

  const commandInfo = await commandRepository.getCommandInfo(commandName);

  if (commandInfo?.maintenance && interaction.user.id !== bot.ownerId)
    return errorReply(
      T('events:maintenance', {
        reason: commandInfo.maintenanceReason,
      }),
    );

  const [executorIndex, interactionTarget, commandId] = interaction.data.customId.split('|');

  if (interactionTarget.length > 1 && interactionTarget !== `${interaction.user.id}`)
    return errorReply(
      T('permissions:NOT_INTERACTION_OWNER', { owner: mentionUser(interactionTarget) }),
    );

  const execute = command.commandRelatedExecutions[Number(executorIndex)];

  if (!execute) return errorReply(T('permissions:UNKNOWN_SLASH'));

  if (commandInfo?.discordId && commandInfo.discordId !== `${commandId}`) {
    await bot.helpers
      .sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.UpdateMessage,
        data: {
          components: [],
        },
      })
      .catch(() => null);

    await bot.helpers
      .sendFollowupMessage(interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content: `<:negacao:759603958317711371> | ${T('permissions:COMPONENT_OUTDATED')}`,
          flags: MessageFlags.EPHEMERAL,
        },
      })
      .catch(() => null);
    return;
  }

  const guildLocale = i18next.getFixedT(
    await guildRepository.getGuildLanguage(interaction.guildId as bigint),
  );

  const ctx = new ComponentInteractionContext(interaction as ComponentInteraction, guildLocale);

  await new Promise((res) => {
    execute(ctx).catch((err) => {
      errorReply(
        T('events:error_embed.title', {
          cmd: command.name,
        }),
      );

      // eslint-disable-next-line no-param-reassign
      if (typeof err === 'string') err = new Error(err);

      if (err instanceof Error && err.stack) {
        const errorMessage = err.stack.length > 3800 ? `${err.stack.slice(0, 3800)}...` : err.stack;
        const embed = createEmbed({
          color: 0xfd0000,
          title: `${process.env.NODE_ENV === 'DEVELOPMENT' ? '[BETA]' : ''} ${T(
            'events:error_embed.title',
            {
              cmd: command.name,
            },
          )}`,
          description: `\`\`\`js\n${errorMessage}\`\`\``,
          fields: [
            {
              name: '<:atencao:759603958418767922> | Quem Usou',
              value: `UserId: \`${interaction.user.id}\` \nServerId: \`${interaction.guildId}\``,
            },
          ],
          timestamp: Date.now(),
        });

        bot.helpers.sendWebhookMessage(BigInt(ERROR_WEBHOOK_ID), ERROR_WEBHOOK_TOKEN, {
          embeds: [embed],
          content: `COMPONENTE UTILIZADO! Index: ${executorIndex}\n${commandId}`,
        });
      }
    });

    res(undefined);
  });
};

export { componentExecutor };
