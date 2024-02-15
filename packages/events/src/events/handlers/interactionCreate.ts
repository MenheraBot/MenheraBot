import { InteractionResponseTypes, InteractionTypes } from 'discordeno/types';
import i18next from 'i18next';

import blacklistRepository from '../../database/repositories/blacklistRepository';
import commandRepository from '../../database/repositories/commandRepository';
import guildRepository from '../../database/repositories/guildRepository';
import userRepository from '../../database/repositories/userRepository';
import { bot } from '../../index';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { autocompleteInteraction } from '../../structures/command/autocompleteInteraction';
import { componentExecutor } from '../../structures/command/componentExecutor';
import { getCommandsCounter, getRateLimitCounter } from '../../structures/initializePrometheus';
import { UsedCommandData } from '../../types/commands';
import { DatabaseUserSchema } from '../../types/database';
import { postCommandExecution } from '../../utils/apiRequests/commands';
import { getUserLastBanData } from '../../utils/apiRequests/statistics';
import { createEmbed } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { getEnviroments } from '../../utils/getEnviroments';
import { logger } from '../../utils/logger';
import { millisToSeconds } from '../../utils/miscUtils';
import cacheRepository from '../../database/repositories/cacheRepository';
import { sendInteractionResponse } from '../../utils/discord/interactionRequests';
import { debugError } from '../../utils/debugError';
import { getFullCommandUsed } from '../../structures/command/getCommandOption';
import ratelimitRepository from '../../database/repositories/ratelimitRepository';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

const setInteractionCreateEvent = (): void => {
  bot.events.interactionCreate = async (_, interaction) => {
    if (
      interaction.type === InteractionTypes.MessageComponent ||
      interaction.type === InteractionTypes.ModalSubmit
    ) {
      componentExecutor(interaction);
      return;
    }

    if (interaction.type === InteractionTypes.Ping) return;

    if (interaction.type === InteractionTypes.ApplicationCommandAutocomplete)
      return autocompleteInteraction(interaction);

    const errorReply = async (content: string): Promise<void> => {
      await sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content: `<:negacao:759603958317711371> | ${content}`,
          // eslint-disable-next-line no-bitwise
          flags: MessageFlags.EPHEMERAL | MessageFlags.SUPPRESS_EMBEDS,
        },
      }).catch(debugError);
    };

    if (bot.shuttingDown)
      return errorReply(
        '# <:MenheraBed:768621224993095680>A mimir \n\nOiii. Eu estou indo dormir um pouquinho >.<\n\nLogo mais estou de volta, é algo bem rápido mesmo. Se quiser saber mais, entre em meu servidor de suporte, ou acesse a página de status da Menhera. Tudo disponível [no meu Website](https://menherabot.xyz/?ref=downtime-message).\n\n||Comandos estão desabilitados enquanto efetuamos um restart nos serviços. Isso não é uma ação comum, acesse a status page para mais informações: https://menherabot.xyz/status||',
      );

    const isUserBanned = await blacklistRepository.isUserBanned(interaction.user.id);

    const T = i18next.getFixedT(interaction.user.locale ?? 'pt-BR');

    if (isUserBanned) {
      const bannedInfo = await userRepository.getBannedUserInfo(interaction.user.id);

      const banReason = bannedInfo?.banReason ?? T('events:banned_no_reason');

      // eslint-disable-next-line no-nested-ternary
      const bannedSince = bannedInfo?.bannedSince
        ? bannedInfo.bannedSince !== 'NO_DATA'
          ? `<t:${millisToSeconds(Number(bannedInfo.bannedSince))}>`
          : T('events:banned_long_ago')
        : T('events:banned_long_ago');

      await errorReply(
        T('permissions:BANNED_INFO', {
          banReason,
          bannedSince,
        }),
      );

      if (bannedSince === 'NO_DATA') return;

      if (bannedSince.startsWith('<')) return;

      const lastBan = await getUserLastBanData(interaction.user.id);

      if (!lastBan) {
        await userRepository.updateUser(interaction.user.id, { bannedSince: 'NO_DATA' });
        return;
      }

      await userRepository.updateUser(interaction.user.id, { bannedSince: lastBan });

      return;
    }

    const commandName = interaction.data?.name as string;
    const command = bot.commands.get(commandName);

    if (!command) return errorReply(T('permissions:UNKNOWN_SLASH'));

    if (command.devsOnly && interaction.user.id !== bot.ownerId)
      return errorReply(T('permissions:ONLY_DEVS'));

    const commandUsed = getFullCommandUsed(interaction);

    const commandInfo = await commandRepository.getCommandInfo(commandName);

    const maintenance = commandInfo?.maintenance;

    if (Array.isArray(maintenance)) {
      const maintenanceData = maintenance.find((a) =>
        commandUsed.fullCommand.includes(a.commandStructure),
      );

      if (maintenanceData /*  && interaction.user.id !== bot.ownerId */)
        return errorReply(
          T('events:maintenance', {
            reason: maintenanceData.reason,
          }),
        );
    }

    if (bot.enableRatelimit) {
      const [isRateLimited, info] = await ratelimitRepository.executeRatelimit(
        interaction.user.id,
        commandName,
      );

      if (isRateLimited) {
        if (!process.env.NOMICROSERVICES)
          getRateLimitCounter().inc(
            {
              type: ratelimitRepository.limitLevels[info.ratelimit],
            },
            0.5,
          );

        logger.info(
          `[RATELIMIT] - Limited the ${info.count} time in severity ${
            ratelimitRepository.limitLevels[info.ratelimit]
          } command ${commandName} for user ${interaction.user.id}`,
        );

        return errorReply(
          T('permissions:RATE_LIMITED', {
            commandName,
            unix:
              millisToSeconds(info.timestamp) + ratelimitRepository.secondsToBlock[info.ratelimit],
          }),
        );
      }
    }

    const authorData =
      command.authorDataFields.length > 0
        ? await userRepository.ensureFindUser(interaction.user.id)
        : null;

    cacheRepository.setDiscordUser(bot.transformers.reverse.user(bot, interaction.user));

    const guildLocale = await guildRepository.getGuildLanguage(interaction.guildId as bigint);

    const ctx = new ChatInputInteractionContext(
      interaction,
      authorData as DatabaseUserSchema,
      guildLocale,
    );

    bot.commandsInExecution += 1;

    if (!process.env.NOMICROSERVICES)
      getCommandsCounter().inc(
        {
          command_name: commandUsed.command,
          complete_command: commandUsed.fullCommand,
        },
        0.5,
      );

    await command
      .execute(ctx, () => null)
      .catch((err) => {
        errorReply(
          T('events:error_embed.title', {
            cmd: command.name,
          }),
        );

        // eslint-disable-next-line no-param-reassign
        if (typeof err === 'string') err = new Error(err);

        if (err instanceof Error && err.stack) {
          const errorMessage =
            err.stack.length > 3800 ? `${err.stack.slice(0, 3800)}...` : err.stack;
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
          });
        }
      });

    bot.commandsInExecution -= 1;

    logger.info(`[COMMAND] ${commandUsed.fullCommand} - ${interaction.user.id}`);

    if (!interaction.guildId) return;

    const data: UsedCommandData = {
      authorId: `${interaction.user.id}`,
      guildId: `${interaction.guildId}`,
      commandName: command.name,
      data: Date.now(),
      args: interaction.data?.options ?? [],
    };

    postCommandExecution(data);
  };
};

export { setInteractionCreateEvent };
