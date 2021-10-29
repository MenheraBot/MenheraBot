import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import { emojis } from '@structures/Constants';
import Util from '@utils/Util';

export default class LanguageInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'idioma',
      description: '「🌐」・Mude o idioma em que eu falo neste servidor!',
      category: 'util',
      cooldown: 15,
      userPermissions: ['MANAGE_GUILD'],
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const selector = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(ctx.translate('select'))
      .addOptions([
        {
          label: ctx.locale('common:english'),
          description: ctx.translate('english'),
          value: 'en-US',
          emoji: emojis.us,
        },
        {
          label: ctx.locale('common:portuguese'),
          description: ctx.translate('portuguese'),
          value: 'pt-BR',
          emoji: emojis.br,
        },
      ]);

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'question'),
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

    LanguageInteractionCommand.editLang(ctx, collectInteracion.values[0]);
  }

  static async editLang(ctx: InteractionCommandContext, lang: string): Promise<void> {
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
}
