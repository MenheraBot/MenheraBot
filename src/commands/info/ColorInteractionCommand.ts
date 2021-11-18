import {
  ColorResolvable,
  MessageComponentInteraction,
  MessageEmbed,
  MessageButton,
  SelectMenuInteraction,
  MessageSelectMenu,
} from 'discord.js-light';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, emojis } from '@structures/Constants';
import { actionRow, resolveCustomId } from '@utils/Util';

export default class ColorInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'cor',
      description: '「🌈」・Muda a cor básica da sua conta',
      category: 'info',
      cooldown: 5,
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
        $push: { colors: { nome: '0 - Padrão', cor: '#a788ff' } },
      });
    }

    if (ctx.data.user.colors.length < 2) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:cor.min-color'),
        ephemeral: true,
      });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('gay_flag', 'commands:cor.embed_title'))
      .setColor(COLORS.Purple)
      .setDescription(ctx.locale('commands:cor.embed_description'));

    const selector = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(`${emojis.rainbow} ${ctx.locale('commands:cor.choose')}`);

    const pages = Math.floor(ctx.data.user.colors.length / 10) + 1;

    for (let i = 0; i < ctx.data.user.colors.length && i < 10; i++) {
      embed.addField(`${ctx.data.user.colors[i].nome}`, `${ctx.data.user.colors[i].cor}`, true);
      selector.addOptions({
        label: ctx.data.user.colors[i].nome.replaceAll('*', ''),
        value: `${ctx.data.user.colors[i].cor}`,
        description: `${ctx.data.user.colors[i].cor}`,
        emoji: ColorInteractionCommand.getEmojiFromColorName(
          ctx.data.user.colors[i].nome.replace(/\D/g, ''),
        ),
      });
    }

    const componentsToSend = [actionRow([selector])];

    if (pages > 1) {
      const nextPageButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | NEXT`)
        .setLabel(ctx.locale('common:next'))
        .setStyle('PRIMARY');

      const backPageButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | BACK`)
        .setLabel(ctx.locale('common:back'))
        .setStyle('PRIMARY')
        .setDisabled(true);

      componentsToSend.push(actionRow([backPageButton, nextPageButton]));

      embed.setFooter(ctx.locale('commands:cor.footer', { page: 1, maxPages: pages }));
    }

    // É o cara do arroz

    await ctx.makeMessage({
      embeds: [embed],
      components: componentsToSend,
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.author.id;

    const collector = ctx.channel.createMessageComponentCollector({
      time: 30000,
      maxComponents: 8,
      filter,
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'selected') ctx.deleteReply();
    });

    let selectedPage = 0;

    collector.on('collect', async (int) => {
      int.deferUpdate();
      const type = resolveCustomId(int.customId);

      const changePage = (toSum: number) => {
        selectedPage += toSum;
        collector.resetTimer();

        const currentMenu = componentsToSend[0].components[0] as MessageSelectMenu;

        currentMenu.spliceOptions(0, currentMenu.options.length);
        embed.spliceFields(0, embed.fields.length);

        for (let i = 10 * selectedPage; currentMenu.options.length < 10; i++) {
          if (i > ctx.data.user.colors.length || typeof ctx.data.user.colors[i] === 'undefined')
            break;
          embed.addField(`${ctx.data.user.colors[i].nome}`, `${ctx.data.user.colors[i].cor}`, true);
          currentMenu.addOptions({
            label: ctx.data.user.colors[i].nome.replaceAll('*', ''),
            value: `${ctx.data.user.colors[i].cor}`,
            description: `${ctx.data.user.colors[i].cor}`,
            emoji: ColorInteractionCommand.getEmojiFromColorName(
              ctx.data.user.colors[i].nome.replace(/\D/g, ''),
            ),
          });
        }

        embed.setFooter(
          ctx.locale('commands:cor.footer', { page: selectedPage + 1, maxPages: pages }),
        );

        if (selectedPage > 0) componentsToSend[1].components[0].setDisabled(false);
        else componentsToSend[1].components[0].setDisabled(true);

        if (selectedPage + 1 === pages) componentsToSend[1].components[1].setDisabled(true);
        else componentsToSend[1].components[1].setDisabled(false);
      };

      switch (type) {
        case 'SELECT': {
          const selected = (int as SelectMenuInteraction).values[0] as ColorResolvable;

          const dataChoose = {
            title: ctx.locale('commands:cor.dataChoose.title'),
            description: ctx.locale('commands:cor.dataChoose.title'),
            color: selected,
            thumbnail: {
              url: 'https://i.imgur.com/t94XkgG.png',
            },
          };

          await ctx.client.repositories.userRepository.update(ctx.author.id, {
            selectedColor: selected,
          });

          ctx.makeMessage({ embeds: [dataChoose], components: [] });
          collector.removeAllListeners();
          collector.stop('selected');
          break;
        }
        case 'NEXT': {
          changePage(1);

          await ctx.makeMessage({
            embeds: [embed],
            components: componentsToSend,
          });
          break;
        }
        case 'BACK': {
          changePage(-1);

          await ctx.makeMessage({
            embeds: [embed],
            components: componentsToSend,
          });
          break;
        }
      }
    });
  }
}
