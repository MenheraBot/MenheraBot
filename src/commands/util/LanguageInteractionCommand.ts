import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { emojis } from '@structures/MenheraConstants';
import Util from '@utils/Util';

export default class LanguageInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
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

    await ctx.reply({
      content: `${emojis.question} | ${ctx.translate('question')}`,
      components: [{ type: 'ACTION_ROW', components: [selector] }],
    });

    const collectInteracion = await Util.collectComponentInteractionWithId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      6969,
    ).catch(() => null);

    if (!collectInteracion) {
      if (ctx.data.server.lang === 'en-US' || ctx.data.user.mamadas < 169) {
        ctx.editReply({
          content: `${emojis.question} | ${ctx.translate('question')}`,
          components: [
            {
              type: 'ACTION_ROW',
              components: [selector.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))],
            },
          ],
        });
        return;
      }

      selector.addOptions({
        label: 'Só Locuragem',
        value: 'pt-LIGMA',
        description: 'Caralho menó tu conseguiu, tu tens poder para utilzar DO BANHO DOS CAMPEÕES',
        emoji: emojis.ligma,
      });

      ctx.editReply({
        content: `${emojis.question} | ${ctx.translate('question')}`,
        components: [{ type: 'ACTION_ROW', components: [selector] }],
      });

      const newCollect = await Util.collectComponentInteractionWithId(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        6969,
      ).catch(() => null);

      if (!newCollect) {
        ctx.editReply({
          content: `${emojis.question} | ${ctx.translate('question')}`,
          components: [
            {
              type: 'ACTION_ROW',
              components: [selector.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))],
            },
          ],
        });
        return;
      }
      this.editLang(ctx, 'pt-LIGMA');
    } else this.editLang(ctx, (collectInteracion as SelectMenuInteraction).values[0]);
  }

  async editLang(ctx: InteractionCommandContext, lang: string): Promise<void> {
    ctx.data.server.lang = lang;
    await this.client.repositories.cacheRepository.updateGuild(
      ctx.interaction.guild?.id as string,
      ctx.data.server,
    );

    switch (lang) {
      case 'en-US':
        ctx.editReply({
          components: [],
          content: 'A you wish, I will speak english on this server',
        });
        break;
      case 'pt-BR':
        ctx.editReply({
          components: [],
          content: 'Perfeito, vou falar português nesse servidor',
        });
        break;
      default:
        ctx.editReply({
          components: [],
          content:
            'Ta na mão cpx, vo fala com a gurizada desse server de um jeito mais, digamos assim, de putão',
        });
    }
  }
}
