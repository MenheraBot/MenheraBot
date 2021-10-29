import {
  ColorResolvable,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, emojis } from '@structures/Constants';

export default class ColorInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cor',
      description: '「🌈」・Muda a cor básica da sua conta',
      category: 'info',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['selectedColor', 'colors'],
    });
  }

  static getEmojiFromColorName(color: string): string {
    const colors: { [key: string]: string } = {
      '0': '🇧🇷',
      '1': '💜',
      '2': '🔴',
      '3': '🔵',
      '4': '🟢',
      '5': '💗',
      '6': '🟡',
    };

    return colors[color] ?? '🌈';
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorData = ctx.data.user;

    const haspadrao = authorData.colors.some((pc) => pc.cor === '#a788ff');

    if (!haspadrao) {
      await ctx.client.repositories.userRepository.update(ctx.author.id, {
        $push: { cores: { nome: '0 - Padrão', cor: '#a788ff', price: 0 } },
      });
    }
    const embed = new MessageEmbed()
      .setTitle(`🏳️‍🌈 | ${ctx.translate('embed_title')}`)
      .setColor(COLORS.Purple)
      .setDescription(ctx.translate('embed_description'));

    const selector = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(`${emojis.rainbow} ${ctx.translate('choose')}`);

    if (authorData.colors.length < 2) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'min-color'), ephemeral: true });
      return;
    }

    for (let i = 0; i < authorData.colors.length; i++) {
      if (authorData.colors[i].cor !== authorData.selectedColor) {
        embed.addField(`${authorData.colors[i].nome}`, `${authorData.colors[i].cor}`);
        selector.addOptions({
          label: authorData.colors[i].nome.replaceAll('*', ''),
          value: `${authorData.colors[i].cor}`,
          emoji: ColorInteractionCommand.getEmojiFromColorName(
            authorData.colors[i].nome.replace(/\D/g, ''),
          ),
        });
      }
    }

    await ctx.makeMessage({
      embeds: [embed],
      components: [{ type: 'ACTION_ROW', components: [selector] }],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.user.id === ctx.author.id && int.customId === ctx.interaction.id;

    const collect = await ctx.channel
      .awaitMessageComponent({ componentType: 'SELECT_MENU', time: 15000, filter })
      .catch(() => null);

    if (!collect || !collect.isSelectMenu()) {
      ctx.makeMessage({
        embeds: [embed],
        components: [
          {
            type: 'ACTION_ROW',
            components: [
              selector.setDisabled(true).setPlaceholder(`⌛ | ${ctx.locale('common:timesup')}`),
            ],
          },
        ],
      });
      return;
    }

    const selected = collect.values[0] as ColorResolvable;

    const dataChoose = {
      title: ctx.translate('dataChoose.title'),
      description: ctx.translate('dataChoose.title'),
      color: selected,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
    };

    await ctx.client.repositories.userRepository.update(ctx.author.id, {
      cor: selected,
    });

    ctx.makeMessage({ embeds: [dataChoose], components: [] });
  }
}
