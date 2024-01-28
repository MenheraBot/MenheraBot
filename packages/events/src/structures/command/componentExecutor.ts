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
import cacheRepository from '../../database/repositories/cacheRepository';
import { logger } from '../../utils/logger';
import {
  sendFollowupMessage,
  sendInteractionResponse,
} from '../../utils/discord/interactionRequests';
import { getFullCommandUsed } from './getCommandOption';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

const componentExecutor = async (interaction: Interaction): Promise<void> => {
  cacheRepository.setDiscordUser(bot.transformers.reverse.user(bot, interaction.user));
  if (!interaction.data?.customId) return;

  const [executorIndex, interactionTarget, commandId] = interaction.data.customId.split('|');

  const commandInfo = await commandRepository.getCommandInfoById(commandId);
  const T = i18next.getFixedT(interaction.user.locale ?? 'pt-BR');

  if (!commandInfo) {
    await sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.UpdateMessage,
      data: {
        components: [],
      },
    }).catch(() => null);

    await sendFollowupMessage(interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: `<:negacao:759603958317711371> | ${T('permissions:COMPONENT_OUTDATED')}`,
        flags: MessageFlags.EPHEMERAL,
      },
    }).catch(() => null);
    return;
  }

  const errorReply = async (content: string): Promise<void> => {
    await sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: `<:negacao:759603958317711371> | ${content}`,
        flags: MessageFlags.EPHEMERAL,
        allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
      },
    }).catch(() => null);
  };

  const command = bot.commands.get(commandInfo._id);

  if (!command) return errorReply(T('permissions:UNKNOWN_SLASH'));

  if (!command.commandRelatedExecutions || command.commandRelatedExecutions.length === 0) return;

  if (bot.shuttingDown)
    return errorReply(
      'A Menhera está em processo de desligamento! Comandos estão desativados!\n\nMenhera is in the process of shutting down! Commands are disabled!',
    );

  const commandUsed = getFullCommandUsed(interaction);

  if (Array.isArray(commandInfo.maintenance)) {
    const maintenance = commandInfo.maintenance.find((a) =>
      commandUsed.fullCommand.includes(a.commandStructure),
    );

    if (maintenance && interaction.user.id !== bot.ownerId)
      return errorReply(
        T('events:maintenance', {
          reason: maintenance.reason,
        }),
      );
  }

  const isUserBanned = await blacklistRepository.isUserBanned(interaction.user.id);

  if (isUserBanned) {
    const bannedInfo = await userRepository.getBannedUserInfo(interaction.user.id);

    return errorReply(
      T('permissions:BANNED_INFO', {
        banReason: bannedInfo?.banReason,
      }),
    );
  }

  if (interactionTarget.length > 1 && interactionTarget !== `${interaction.user.id}`)
    return errorReply(
      T('permissions:NOT_INTERACTION_OWNER', { owner: mentionUser(interactionTarget) }),
    );

  const execute = command.commandRelatedExecutions[Number(executorIndex)];

  if (!execute) return errorReply(T('permissions:UNKNOWN_SLASH'));

  const guildLocale = await guildRepository.getGuildLanguage(interaction.guildId as bigint);

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
          title: `${process.env.NODE_ENV === 'development' ? '[DEV]' : ''} ${T(
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

  logger.info(`[COMPONENT] ${commandInfo._id} - ${ctx.user.id} "${interaction.data.customId}"`);
};

export { componentExecutor };
