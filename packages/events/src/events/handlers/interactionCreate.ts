import { InteractionResponseTypes, InteractionTypes } from 'discordeno/types';
import i18next from 'i18next';

import { postCommandExecution } from '../../utils/apiRequests/menheraApiRequests';
import { UsedCommandData } from '../../types/commands';
import { getEnviroments } from '../../utils/getEnviroments';
import { DatabaseUserSchema } from '../../types/database';
import { MessageFlags } from '../../utils/discord/messageUtils';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import InteractionContext from '../../structures/command/InteractionContext';
import { bot, interactionEmitter } from '../../index';
import userRepository from '../../database/repositories/userRepository';
import commandRepository from '../../database/repositories/commandRepository';
import { createEmbed } from '../../utils/discord/embedUtils';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

const setInteractionCreateEvent = (): void => {
  bot.events.interactionCreate = async (_, interaction) => {
    if (interaction.type !== InteractionTypes.ApplicationCommand) {
      interactionEmitter.emit('interaction', interaction);
      return;
    }

    const errorReply = async (content: string): Promise<void> => {
      await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content,
          flags: MessageFlags.EPHEMERAL,
        },
      });
    };

    const isUserBanned = await blacklistRepository.isUserBanned(interaction.user.id);

    const T = i18next.getFixedT(interaction.user.locale ?? 'pt-BR');

    if (isUserBanned) {
      const bannedInfo = await userRepository.getBannedUserInfo(interaction.user.id);

      return errorReply(
        `<:negacao:759603958317711371> | ${T('permissions:BANNED_INFO', {
          banReason: bannedInfo?.banReason,
        })}`,
      );
    }

    const commandName = interaction.data?.name as string;
    const command = bot.commands.get(commandName);

    if (!command) return errorReply(T('permissions:UNKNOWN_SLASH'));

    // TODO: Check command single execution

    if (command.devsOnly && interaction.user.id !== bot.ownerId)
      return errorReply(T('permissions:ONLY_DEVS'));

    const commandMaintenanceInfo = await commandRepository.getMaintenanceInfo(commandName);

    if (commandMaintenanceInfo?.maintenance && interaction.user.id !== bot.ownerId)
      return errorReply(
        `<:negacao:759603958317711371> | ${T('events:maintenance', {
          reason: commandMaintenanceInfo.maintenanceReason,
        })}`,
      );

    const authorData =
      command.authorDataFields.length > 0
        ? await userRepository.ensureFindUser(interaction.user.id)
        : null;

    const guildLocale = i18next.getFixedT(interaction.guildLocale ?? 'pt-BR');

    const ctx = new InteractionContext(interaction, authorData as DatabaseUserSchema, guildLocale);

    await command.execute(ctx).catch((err) => {
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
          title: `${process.env.NODE_ENV === 'development' ? '[BETA]' : ''} ${T(
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

        bot.helpers.sendWebhook(BigInt(ERROR_WEBHOOK_ID), ERROR_WEBHOOK_TOKEN, { embeds: [embed] });
      }
    });

    if (!interaction.guildId || process.env.NODE_ENV !== 'production') return;

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
