import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, emojis } from '@structures/Constants';
import { AvailableThemeTypes, IReturnData, ThemeFiles } from '@utils/Types';
import Util, {
  actionRow,
  disableComponents,
  getAllThemeUserIds,
  getThemeById,
  resolveCustomId,
  toWritableUTF,
} from '@utils/Util';
import {
  ColorResolvable,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

export default class PersonalizeInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'personalizar',
      description: '「🎨」・Personalize o seu perfil para ficar a coisa mais linda do mundo!',
      options: [
        {
          name: 'info',
          description: '「💬」・Mude o seu sobremim (A mensagem que aparece em seu perfil)',
          type: 'SUB_COMMAND',
          options: [
            {
              type: 'STRING',
              name: 'frase',
              description: 'Frase para colocar em seu sobre mim. No máximo 200 caracteres',
              required: true,
            },
          ],
        },
        {
          name: 'cor',
          description: '「🌈」・Muda a cor básica da sua conta',
          type: 'SUB_COMMAND',
        },
        {
          name: 'temas',
          description: '「🎊」・Personalize os temas da sua conta!',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'tipo',
              description: 'O tipo de tema que você quer alterar',
              type: 'STRING',
              required: true,
              choices: [
                { name: '✨ | Perfil', value: 'profile' },
                { name: '🃏 | Estilo de Carta', value: 'cards' },
                { name: '🖼️ | Mesa de Cartas', value: 'table' },
                { name: '🎴 | Fundo de Carta', value: 'card_background' },
              ],
            },
          ],
        },
      ],
      category: 'util',
      cooldown: 7,
      authorDataFields: ['selectedColor', 'colors', 'info'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand(true);

    if (command === 'info') PersonalizeInteractionCommand.AboutmeInteractionCommand(ctx);

    if (command === 'cor') PersonalizeInteractionCommand.ColorInteractionCommand(ctx);

    if (command === 'temas') PersonalizeInteractionCommand.ThemesInteractionCommand(ctx);
  }

  static async ThemesInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const themeType = ctx.options.getString('tipo', true) as AvailableThemeTypes;

    const userThemes = await ctx.client.repositories.themeRepository.findOrCreate(ctx.author.id);
    const embed = new MessageEmbed()
      .setColor(ctx.data.user.selectedColor)
      .setTitle(ctx.locale(`commands:temas.${themeType}`));

    const selectMenu = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setMinValues(1)
      .setMaxValues(1);

    const availableProfiles = getAllThemeUserIds(userThemes).reduce<IReturnData<ThemeFiles>[]>(
      (p, c) => {
        if (c.inUse) return p;

        const theme = getThemeById(c.id);

        if (theme.data.type !== themeType) return p;

        p.push(theme);

        selectMenu.addOptions({
          label: ctx.locale(`data:themes.${c.id as 1}.name`),
          value: `${c.id}`,
          description: ctx.locale(`data:themes.${c.id as 1}.description`).substring(0, 100),
        });

        embed.addField(
          ctx.locale(`data:themes.${c.id as 1}.name`),
          `${ctx.locale(`data:themes.${c.id as 1}.description`)}\n**${ctx.locale(
            'common:rarity',
          )}**: ${ctx.locale(`common:rarities.${theme.data.rarity}`)}`,
          true,
        );
        return p;
      },
      [],
    );

    if (availableProfiles.length === 0) {
      embed.setDescription(ctx.locale('commands:temas.no-themes'));
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    ctx.makeMessage({ components: [actionRow([selectMenu])], embeds: [embed] });

    const collected = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      10000,
    );

    if (!collected) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    switch (themeType) {
      case 'cards':
        ctx.client.repositories.themeRepository.setCardsTheme(
          ctx.author.id,
          Number(collected.values[0]),
        );
        break;
      case 'card_background':
        ctx.client.repositories.themeRepository.setCardBackgroundTheme(
          ctx.author.id,
          Number(collected.values[0]),
        );
        break;
      case 'profile':
        ctx.client.repositories.themeRepository.setProfileTheme(
          ctx.author.id,
          Number(collected.values[0]),
        );
        break;
      case 'table':
        ctx.client.repositories.themeRepository.setTableTheme(
          ctx.author.id,
          Number(collected.values[0]),
        );
        break;
    }

    ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('success', 'commands:temas.selected'),
    });
  }

  static async ColorInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const haspadrao = ctx.data.user.colors.some((pc) => pc.cor === COLORS.Default);

    const getEmojiFromColorName = (color: string): string => {
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
    };
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
        emoji: getEmojiFromColorName(ctx.data.user.colors[i].nome.replace(/\D/g, '')),
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
            emoji: getEmojiFromColorName(ctx.data.user.colors[i].nome.replace(/\D/g, '')),
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

  static async AboutmeInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const info = ctx.options.getString('frase', true);

    if (info.length > 200) {
      await ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:sobremim.args-limit'),
        ephemeral: true,
      });
      return;
    }

    await ctx.client.repositories.userRepository.update(ctx.author.id, {
      info: toWritableUTF(info),
    });

    await ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:sobremim.success') });
  }
}
