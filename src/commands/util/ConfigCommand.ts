import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { SelectMenuInteraction, MessageSelectMenu } from 'discord.js-light';
import Util from '@utils/Util';
import { emojis } from '@structures/Constants';

export default class ConfigCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'config',
      description: '「⚙️」・Configure a Menhera no servidor',
      category: 'util',
      options: [
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

    if (command === 'idioma') ConfigCommand.LanguageInteractionCommand(ctx);

    // if (command === 'censura') ConfigCommand.CensorInteractionCommand(ctx);
  }

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

    const collectInteracion =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
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
}
