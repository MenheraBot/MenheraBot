import {
  ColorResolvable,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, emojis } from '@structures/MenheraConstants';

export default class ColorInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'cor',
      description: '「🌈」・Muda a cor básica da sua conta',
      category: 'info',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
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

    const haspadrao = authorData.cores.some((pc) => pc.cor === '#a788ff');

    if (!haspadrao) {
      await this.client.repositories.userRepository.update(ctx.author.id, {
        $push: { cores: { nome: '0 - Padrão', cor: '#a788ff', price: 0 } },
      });
    }
    const embed = new MessageEmbed()
      .setTitle(`🏳️‍🌈 | ${ctx.locale('commands:color.embed_title')}`)
      .setColor(COLORS.Purple)
      .setDescription(ctx.locale('commands:color.embed_description'));

    const selector = new MessageSelectMenu()
      .setCustomId(ctx.interaction.id)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(`${emojis.rainbow} ${ctx.locale('commands:color.choose')}`);

    if (authorData.cores.length < 2) {
      ctx.replyT('error', 'commands:color.min-color', {}, true);
      return;
    }

    for (let i = 0; i < authorData.cores.length; i++) {
      if (authorData.cores[i].cor !== authorData.cor) {
        embed.addField(`${authorData.cores[i].nome}`, `${authorData.cores[i].cor}`);
        selector.addOptions({
          label: authorData.cores[i].nome.replaceAll('*', ''),
          value: `${authorData.cores[i].cor}`,
          emoji: ColorInteractionCommand.getEmojiFromColorName(
            authorData.cores[i].nome.replace(/\D/g, ''),
          ),
        });
      }
    }

    await ctx.reply({
      embeds: [embed],
      components: [{ type: 'ACTION_ROW', components: [selector] }],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.user.id === ctx.author.id && int.customId === ctx.interaction.id;

    const collect = await ctx.channel
      .awaitMessageComponent({ componentType: 'SELECT_MENU', time: 15000, filter })
      .catch(() => null);

    if (!collect || !collect.isSelectMenu()) {
      ctx.editReply({
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
      title: ctx.locale('commands:color.dataChoose.title'),
      description: ctx.locale('commands:color.dataChoose.title'),
      color: selected,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
    };

    await this.client.repositories.userRepository.update(ctx.author.id, {
      cor: selected,
    });

    ctx.editReply({ embeds: [dataChoose], components: [] });
  }
}
