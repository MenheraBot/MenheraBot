import {
  ColorResolvable,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, emojis } from '@structures/Constants';
import { actionRow } from '@utils/Util';

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
    const haspadrao = ctx.data.user.colors.some((pc) => pc.cor === COLORS.Default);

    if (!haspadrao) {
      await ctx.client.repositories.userRepository.update(ctx.author.id, {
        $push: { cores: { nome: '0 - Padrão', cor: '#a788ff' } },
      });
    }

    if (ctx.data.user.colors.length < 2) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'min-color'), ephemeral: true });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('gay_flag', 'embed_title'))
      .setColor(COLORS.Purple)
      .setDescription(ctx.translate('embed_description'));

    const selector = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(`${emojis.rainbow} ${ctx.translate('choose')}`);

    for (let i = 0; i < ctx.data.user.colors.length && i < 25; i++) {
      if (ctx.data.user.colors[i].cor !== ctx.data.user.selectedColor) {
        embed.addField(`${ctx.data.user.colors[i].nome}`, `${ctx.data.user.colors[i].cor}`);
        selector.addOptions({
          label: ctx.data.user.colors[i].nome.replaceAll('*', ''),
          value: `${ctx.data.user.colors[i].cor}`,
          emoji: ColorInteractionCommand.getEmojiFromColorName(
            ctx.data.user.colors[i].nome.replace(/\D/g, ''),
          ),
        });
      }
    }

    const componentsToSend = [actionRow([selector])];

    // É o cara do arroz

    await ctx.makeMessage({
      embeds: [embed],
      components: componentsToSend,
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
