import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton, SelectMenuInteraction, MessageSelectMenu } from 'discord.js-light';
import Util from '@utils/Util';
import { emojis } from '@structures/Constants';

export default class ConfigInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'config',
      description: '「⚙️」・Configure a Menhera no servidor',
      category: 'util',
      options: [
        {
          name: 'blockcomando',
          description: '「🚫」・Muda as permissões de uso de comandos meus nesse servidor!',
          type: 'SUB_COMMAND',
          options: [
            {
              type: 'STRING',
              name: 'comando',
              description: 'Comando para bloquear/desbloquear',
              required: true,
            },
          ],
        },
        {
          name: 'blockcanal',
          description: '「🚫」・Mude as permissões de comandos nos canais',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'block',
              description: '「🚫」・ Adicione ou remova um canal da lista de bloqueados',
              type: 'SUB_COMMAND',
              options: [
                {
                  type: 'CHANNEL',
                  name: 'canal',
                  description: 'Canal para ser bloqueado/desbloqueado',
                  required: true,
                  channelTypes: ['GUILD_TEXT'],
                },
              ],
            },
            {
              name: 'lista',
              description: '「📄」・ Modifique a lista de comandos bloqueados',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'opcao',
                  description: 'A opção que você deseja fazer na lista de comandos bloqueados',
                  type: 'STRING',
                  required: true,
                  choices: [
                    {
                      name: '🗑️ | Remover Todos Canais',
                      value: 'delete',
                    },
                    {
                      name: '📜 | Ver Canais Bloqueados',
                      value: 'view',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'idioma',
          description: '「🌐」・Mude o idioma em que eu falo neste servidor!',
          type: 'SUB_COMMAND',
        },
        /*  {
          name: 'censura',
          description: '🤬 | Ativa ou desativa a censura de palavrões',
          type: 'SUB_COMMAND',
        }, */
      ],
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.interaction.memberPermissions?.missing('MANAGE_GUILD')) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'permissions:USER_MISSING_PERMISSION', {
          perm: ctx.locale('permissions:MANAGE_GUILD'),
        }),
      });
      return;
    }

    const command = ctx.options.getSubcommand();

    if (command === 'block') ConfigInteractionCommand.BlockChannelInteractionCommand(ctx);

    if (command === 'lista') ConfigInteractionCommand.ListBlockedChannelsInteractionCommand(ctx);

    if (command === 'idioma') ConfigInteractionCommand.LanguageInteractionCommand(ctx);

    if (command === 'blockcomando') this.BlockCmdInteractionCommand(ctx);

    // if (command === 'censura') ConfigInteractionCommand.CensorInteractionCommand(ctx);
  }

  /*  --------------- OLD CENSOR CONFIGURATION, MAYBE CHANGE TO UNCENSORED FOR THE FUTURE
  static async CensorInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.data.server.censored) {
      ctx.data.server.censored = false;

      await ctx.client.repositories.cacheRepository.updateGuild(
        ctx.interaction.guild?.id as string,
        ctx.data.server,
      );

      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:censura.uncensored'),
      });
      return;
    }

    ctx.data.server.censored = true;

    await ctx.client.repositories.cacheRepository.updateGuild(
      ctx.interaction.guild?.id as string,
      ctx.data.server,
    );

    await ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:censura.censored'),
    });
  }
 */
  static async LanguageInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const selector = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.locale('commands:idioma.select'))
      .addOptions([
        {
          label: ctx.locale('common:english'),
          description: ctx.locale('commands:idioma.english'),
          value: 'en-US',
          emoji: emojis.us,
        },
        {
          label: ctx.locale('common:portuguese'),
          description: ctx.locale('commands:idioma.portuguese'),
          value: 'pt-BR',
          emoji: emojis.br,
        },
      ]);

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:idioma.question'),
      components: [{ type: 'ACTION_ROW', components: [selector] }],
    });

    const collectInteracion = await Util.collectComponentInteractionWithId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      10000,
    ).catch(() => null);

    if (!collectInteracion) {
      ctx.makeMessage({
        components: [
          {
            type: 'ACTION_ROW',
            components: [selector.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))],
          },
        ],
      });
      return;
    }

    const lang = collectInteracion.values[0];

    ctx.data.server.lang = lang;

    await ctx.client.repositories.cacheRepository.updateGuild(
      ctx.interaction.guild?.id as string,
      ctx.data.server,
    );

    switch (lang) {
      case 'en-US':
        ctx.makeMessage({
          components: [],
          content: 'A you wish, I will speak english on this server',
        });
        break;
      case 'pt-BR':
        ctx.makeMessage({
          components: [],
          content: 'Perfeito, vou falar português nesse servidor',
        });
        break;
    }
  }

  static async ListBlockedChannelsInteractionCommand(
    ctx: InteractionCommandContext,
  ): Promise<void> {
    const option = ctx.options.getString('opcao', true);

    switch (option) {
      case 'view':
        ctx.makeMessage({
          content: `${emojis.list} | ${ctx.locale('commands:blockcanal.blocked-channels')}\n\n${
            ctx.data.server.blockedChannels.length === 0
              ? ctx.locale('commands:blockcanal.zero-value')
              : ctx.data.server.blockedChannels.map((a) => `• <#${a}>`).join('\n')
          }`,
        });
        break;
      case 'delete': {
        ctx.makeMessage({
          content: ctx.locale('commands:blockcanal.sure'),
          components: [
            {
              type: 'ACTION_ROW',
              components: [
                new MessageButton()
                  .setCustomId(ctx.interaction.id)
                  .setStyle('DANGER')
                  .setLabel(ctx.locale('common:confirm')),
              ],
            },
          ],
        });

        const confirmed = await Util.collectComponentInteractionWithId(
          ctx.channel,
          ctx.author.id,
          ctx.interaction.id,
          7000,
        );

        if (confirmed && ctx.interaction.guild) {
          ctx.client.repositories.guildRepository.update(ctx.interaction.guild.id, {
            blockedChannels: [],
          });
          ctx.makeMessage({
            components: [],
            content: ctx.prettyResponse('yes', 'commands:blockcanal.done'),
          });
          return;
        }

        ctx.deleteReply();
        break;
      }
    }
  }

  static async BlockChannelInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const selectedChannel = ctx.options.getChannel('canal', true);

    if (selectedChannel?.type !== 'GUILD_TEXT') {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blockcanal.invalid-channel'),
        ephemeral: true,
      });
      return;
    }

    if (ctx.data.server.blockedChannels.includes(selectedChannel.id)) {
      const index = ctx.data.server.blockedChannels.indexOf(selectedChannel.id);

      ctx.data.server.blockedChannels.splice(index, 1);
      await ctx.client.repositories.cacheRepository.updateGuild(
        ctx.interaction.guild?.id as string,
        ctx.data.server,
      );
      await ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:blockcanal.unblock', {
          channel: selectedChannel.toString(),
        }),
      });
      return;
    }
    ctx.data.server.blockedChannels.push(selectedChannel.id);
    await ctx.client.repositories.cacheRepository.updateGuild(
      ctx.interaction.guild?.id as string,
      ctx.data.server,
    );
    await ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:blockcanal.block', {
        channel: selectedChannel.toString(),
      }),
    });
  }

  async BlockCmdInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const cmd = ctx.client.slashCommands.get(ctx.options.getString('comando', true));

    if (!cmd) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blockcomando.no-cmd'),
      });
      return;
    }

    if (cmd.config.devsOnly) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:blockcomando.dev-cmd'),
      });
      return;
    }

    if (cmd.config.name === this.config.name) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:blockcomando.foda') });
      return;
    }

    if (ctx.data.server.disabledCommands?.includes(cmd.config.name)) {
      const index = ctx.data.server.disabledCommands.indexOf(cmd.config.name);

      ctx.data.server.disabledCommands.splice(index, 1);
      await ctx.client.repositories.cacheRepository.updateGuild(
        ctx.interaction.guild?.id as string,
        ctx.data.server,
      );
      await ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:blockcomando.unblock', {
          cmd: cmd.config.name,
        }),
      });
      return;
    }
    ctx.data.server.disabledCommands.push(cmd.config.name);
    await ctx.client.repositories.cacheRepository.updateGuild(
      ctx.interaction.guild?.id as string,
      ctx.data.server,
    );
    await ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:blockcomando.block', {
        cmd: cmd.config.name,
      }),
    });
  }
}
