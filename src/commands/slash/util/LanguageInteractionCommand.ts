import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageSelectMenu, SelectMenuInteraction, TextBasedChannels } from 'discord.js';
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
      .setPlaceholder(ctx.locale('commands:language.select'))
      .addOptions([
        {
          label: ctx.locale('common:english'),
          description: ctx.locale('commands:language.english'),
          value: 'en-US',
          emoji: emojis.us,
        },
        {
          label: ctx.locale('common:portuguese'),
          description: ctx.locale('commands:language.portuguese'),
          value: 'pt-BR',
          emoji: emojis.br,
        },
      ]);

    await ctx.reply({
      content: `${emojis.question} | ${ctx.locale('commands:language.question')}`,
      components: [{ type: 'ACTION_ROW', components: [selector] }],
    });

    const collectInteracion = await Util.collectComponentInteractionWithId(
      ctx.interaction.channel as TextBasedChannels,
      ctx.interaction.user.id,
      ctx.interaction.id,
      6969,
    ).catch(() => null);

    if (!collectInteracion) {
      if (ctx.data.server.lang === 'en-US' || ctx.data.user.mamadas < 169) {
        ctx.editReply({
          content: `${emojis.question} | ${ctx.locale('commands:language.question')}`,
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
        content: `${emojis.question} | ${ctx.locale('commands:language.question')}`,
        components: [{ type: 'ACTION_ROW', components: [selector] }],
      });

      const newCollect = await Util.collectComponentInteractionWithId(
        ctx.interaction.channel as TextBasedChannels,
        ctx.interaction.user.id,
        ctx.interaction.id,
        6969,
      ).catch(() => null);

      if (!newCollect) {
        ctx.editReply({
          content: `${emojis.question} | ${ctx.locale('commands:language.question')}`,
          components: [
            {
              type: 'ACTION_ROW',
              components: [selector.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))],
            },
          ],
        });
      }
    }

    this.editLang(ctx, (collectInteracion as SelectMenuInteraction).values[0]);

    /* if (!ctx.message.guild) return;
    switch (r.emoji.name) {
      case '🇧🇷':
        ctx.data.server.lang = 'pt-BR';
        await this.client.repositories.cacheRepository.updateGuild(
          ctx.message.guild.id,
          ctx.data.server,
        );
        await msg.delete();
        await ctx.message.channel.send(':map: | Agora eu irei falar em ~~brasileiro~~ português');
        break;
      case '🇺🇸':
        ctx.data.server.lang = 'en-US';
        await this.client.repositories.cacheRepository.updateGuild(
          ctx.message.guild.id,
          ctx.data.server,
        );
        await msg.delete();
        await ctx.message.channel.send(":map: | Now I'll talk in english");
        break;
  } */
  }

  async editLang(ctx: InteractionCommandContext, lang: string): Promise<void> {
    ctx.data.server.lang = lang;
    await this.client.repositories.cacheRepository.updateGuild(
      ctx.interaction.guild?.id as string,
      ctx.data.server,
    );
    if (lang === 'pt-LIGMA') {
      ctx.editReply({ components: [], content: ctx.locale('commands:language.ligma') });
      return;
    }
    ctx.editReply({ components: [], content: ctx.locale('commands:language.change') });
  }
}
