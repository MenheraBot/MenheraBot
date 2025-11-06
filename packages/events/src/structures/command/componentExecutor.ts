import { AllowedMentionsTypes, InteractionResponseTypes } from '@discordeno/bot';
import i18next from 'i18next';

import { mentionUser } from '../../utils/discord/userUtils.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import blacklistRepository from '../../database/repositories/blacklistRepository.js';
import { MessageFlags } from '@discordeno/bot';
import { bot } from '../../index.js';
import guildRepository from '../../database/repositories/guildRepository.js';
import ComponentInteractionContext from './ComponentInteractionContext.js';
import { createErrorEmbed } from '../../utils/discord/embedUtils.js';
import { getEnviroments } from '../../utils/getEnviroments.js';
import { ComponentInteraction } from '../../types/interaction.js';
import cacheRepository from '../../database/repositories/cacheRepository.js';
import { logger } from '../../utils/logger.js';
import {
  sendFollowupMessage,
  sendInteractionResponse,
} from '../../utils/discord/interactionRequests.js';
import { Interaction } from '../../types/discordeno.js';
import { debugError } from '../../utils/debugError.js';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

const componentExecutor = async (interaction: Interaction): Promise<void> => {
  cacheRepository.setDiscordUser(bot.transformers.reverse.user(bot, interaction.user));
  if (!interaction.data?.customId) return;

  const T = i18next.getFixedT(interaction.user.locale ?? 'pt-BR');

  const replyOutdatedCommand = () => {
    sendFollowupMessage(interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: `<:negacao:759603958317711371> | ${T('permissions:COMPONENT_OUTDATED')}`,
        flags: MessageFlags.Ephemeral,
      },
    }).catch(debugError);
  };

  if (!interaction.data.customId.includes('|')) {
    const found = await commandRepository.getCustomIdData(interaction.data.customId);

    if (!found) return replyOutdatedCommand();

    interaction.data.customId = found;
  }

  const [executorIndex, interactionTarget, originalInteractionId] =
    interaction.data.customId.split('|');

  const originalInteraction = await commandRepository.getOriginalInteraction(originalInteractionId);

  if (!originalInteraction) return replyOutdatedCommand();

  const errorReply = async (content: string): Promise<void> => {
    await sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: `<:negacao:759603958317711371> | ${content}`,
        flags: MessageFlags.Ephemeral,
        allowedMentions: { parse: [AllowedMentionsTypes.UserMentions] },
      },
    }).catch(debugError);
  };

  const command = bot.commands.get(originalInteraction.commandName);

  if (!command) return errorReply(T('permissions:UNKNOWN_SLASH'));

  if (!command.commandRelatedExecutions || command.commandRelatedExecutions.length === 0) return;

  if (bot.shuttingDown)
    return errorReply(
      'A Menhera está em processo de desligamento! Comandos estão desativados!\n\nMenhera is in the process of shutting down! Commands are disabled!',
    );

  const commandInfo = await commandRepository.getCommandInfo(originalInteraction.commandName);

  if (!commandInfo) return errorReply(T('permissions:UNKNOWN_SLASH'));

  if (Array.isArray(commandInfo.maintenance)) {
    const maintenance = commandInfo.maintenance.find((a) =>
      originalInteraction.fullCommandUsed.includes(a.commandStructure),
    );

    if (maintenance)
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
        const errorEmbed = createErrorEmbed(
          err,
          command.name,
          interaction.user.id,
          interaction.guildId ?? 'None',
        );

        bot.helpers
          .executeWebhook(BigInt(ERROR_WEBHOOK_ID), ERROR_WEBHOOK_TOKEN, {
            embeds: [errorEmbed],
            content: `COMPONENTE UTILIZADO! Index: ${executorIndex}\n${originalInteraction.fullCommandUsed}`,
          })
          .catch(debugError);
      }
    });

    res(undefined);
  });

  logger.info(`[COMPONENT] ${commandInfo._id} - ${ctx.user.id} "${interaction.data.customId}"`);
};

export { componentExecutor };
