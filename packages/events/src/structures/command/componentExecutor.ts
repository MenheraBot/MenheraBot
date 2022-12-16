import { Interaction } from 'discordeno/transformers';
import { InteractionResponseTypes } from 'discordeno/types';
import i18next from 'i18next';

import commandRepository from '../../database/repositories/commandRepository';
import userRepository from '../../database/repositories/userRepository';
import blacklistRepository from '../../database/repositories/blacklistRepository';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { bot } from '../../index';
import guildRepository from '../../database/repositories/guildRepository';
import ComponentInteractionContext from './ComponentInteractionContext';
import { createEmbed } from '../../utils/discord/embedUtils';
import { getEnviroments } from '../../utils/getEnviroments';

const { ERROR_WEBHOOK_ID, ERROR_WEBHOOK_TOKEN } = getEnviroments([
  'ERROR_WEBHOOK_ID',
  'ERROR_WEBHOOK_TOKEN',
]);

/*
                    Sistema pra droppar os collectors
    CustomID: as interactions falam de qual mensagem/comando foram executadas, pegar isso pra referencia
    
    separador = |

    primeira coisa = (index do array de execuçoes de componentes)
    segunda coisa = ID do target ou caractere pra saber que n precisa (N)
    terceira coisa = ID/Timestamp do comando usado
    o resto = data pro comando ser executado

    EXEMPLO DE CUSTOM ID:
    1|435228312214962204|1053395573715243068|1293|EB_BACKGROUND|TRUE

    */

const componentExecutor = async (interaction: Interaction): Promise<void> => {
  const receivedCommandName = interaction.message?.interaction?.name;

  if (!receivedCommandName) return;
  if (!interaction.data?.customId) return;

  // Adicionar um ByPass checks no redis pra nao fazer todas essas verificacoes pra comandos recentes,
  // exemplo do /loja comprar temas, que sao muitos clicks no comando. Salvar a ID da interação do comando
  // interaction.message.interaction.id no redis, e ir adicionando setex de 10 segundos num set de bypass
  // Pra reduzir caracteres, talvez ao inves de colocar o id do comando inteiro, colocar só o timestamp dele
  // Pegando do snowflake. Fazer tudo isso no novo generate custom ID

  const [commandName] = receivedCommandName.split(' ');

  const errorReply = async (content: string): Promise<void> => {
    await bot.helpers
      .sendInteractionResponse(interaction.id, interaction.token, {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        data: {
          content: `<:negacao:759603958317711371> | ${content}`,
          flags: MessageFlags.EPHEMERAL,
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
    return errorReply(T('common:not-your-interaction'));

  const execute = command.commandRelatedExecutions[Number(executorIndex)];

  if (!execute) return errorReply(T('permissions:UNKNOWN_SLASH'));

  const guildLocale = i18next.getFixedT(
    await guildRepository.getGuildLanguage(interaction.guildId as bigint),
  );

  const ctx = new ComponentInteractionContext(interaction, guildLocale);

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

  /* 
  
  Colocar o ID dos comandos no custom id das mensagens para saber se o comando é válido
  const commandVersion = interaction.message?.interaction?.id ?? 0n;

  if (commandInfo?.discordId && commandInfo.discordId !== `${commandVersion}`) {
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
  }
 */
};

export { componentExecutor };
