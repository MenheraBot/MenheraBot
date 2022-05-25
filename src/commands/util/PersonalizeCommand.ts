import Badges from '@data/ProfileBadges';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, DiscordFlagsToMenheraBadges, emojis, EmojiTypes } from '@structures/Constants';
import { AvailableThemeTypes, IReturnData, ThemeFiles } from '@custom_types/Menhera';
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
  InteractionCollector,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
  Modal,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextInputComponent,
} from 'discord.js-light';

export default class PersonalizeCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'personalizar',
      nameLocalizations: { 'en-US': 'personalize' },
      description: '「🎨」・Personalize o seu perfil para ficar a coisa mais linda do mundo!',
      descriptionLocalizations: {
        'en-US': '「🎨」・Customize your profile to be the most beautiful thing in the world!',
      },
      options: [
        {
          name: 'sobre_mim',
          nameLocalizations: { 'en-US': 'about_me' },
          description: '「💬」・Mude o seu "sobre mim" (A mensagem que aparece em seu perfil)',
          descriptionLocalizations: {
            'en-US': '「💬」・Change your "about me" (The message that appears on your profile)',
          },
          type: 'SUB_COMMAND',
          options: [
            {
              type: 'STRING',
              name: 'frase',
              nameLocalizations: { 'en-US': 'phrase' },
              description: 'Frase para colocar em seu sobre mim. No máximo 200 caracteres',
              descriptionLocalizations: {
                'en-US': 'Phrase to put in your about me. Maximum 200 characters',
              },
              required: true,
            },
          ],
        },
        {
          name: 'cor',
          nameLocalizations: { 'en-US': 'color' },
          description: '「🌈」・Muda a cor base da sua conta',
          descriptionLocalizations: { 'en-US': '「🌈」・Change your account base color' },
          type: 'SUB_COMMAND',
        },
        {
          name: 'temas',
          nameLocalizations: { 'en-US': 'themes' },
          description: '「🎊」・Personalize os temas da sua conta!',
          descriptionLocalizations: { 'en-US': '「🎊」・Customize your account themes!' },
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'O tipo de tema que você quer alterar',
              descriptionLocalizations: { 'en-US': 'The type of theme you want to change' },
              type: 'STRING',
              required: true,
              choices: [
                {
                  name: '✨ | Perfil',
                  nameLocalizations: { 'en-US': '✨ | Profile' },
                  value: 'profile',
                },
                {
                  name: '🃏 | Estilo de Carta',
                  nameLocalizations: { 'en-US': '🃏 | Card Style' },
                  value: 'cards',
                },
                {
                  name: '🖼️ | Mesa de Cartas',
                  nameLocalizations: { 'en-US': '🖼️ | Table Cards' },
                  value: 'table',
                },
                {
                  name: '🎴 | Fundo de Carta',
                  nameLocalizations: { 'en-US': '🎴 | Card Background' },
                  value: 'card_background',
                },
              ],
            },
          ],
        },
        {
          name: 'badges',
          description: '「📌」・Escolha quais badges devem aparecer em seu perfil',
          descriptionLocalizations: {
            'en-US': '「📌」・Choose which badges should appear on your profile',
          },
          type: 'SUB_COMMAND',
        },
      ],
      category: 'util',
      cooldown: 7,
      authorDataFields: ['selectedColor', 'colors', 'info', 'badges', 'hiddingBadges'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const command = ctx.options.getSubcommand(true);

    if (command === 'sobre_mim') PersonalizeCommand.AboutmeInteractionCommand(ctx);

    if (command === 'cor') PersonalizeCommand.ColorInteractionCommand(ctx);

    if (command === 'temas') PersonalizeCommand.ThemesInteractionCommand(ctx);

    if (command === 'badges') PersonalizeCommand.BadgesInteractionCommand(ctx);
  }

  static async BadgesInteractionCommand(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setAuthor({
        name: ctx.locale('commands:badges.title'),
        iconURL: ctx.author.displayAvatarURL(),
      })
      .setFooter({ text: ctx.locale('commands:badges.footer') })
      .setColor(ctx.data.user.selectedColor);

    const flags = ctx.author.flags?.toArray() ?? [];

    flags.forEach((a) => {
      if (typeof DiscordFlagsToMenheraBadges[a] === 'undefined') return;
      ctx.data.user.badges.push({
        id: DiscordFlagsToMenheraBadges[a],
        obtainAt: `${ctx.author.createdTimestamp}`,
      });
    });

    const selectMenu = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setMinValues(1)
      .setMaxValues(ctx.data.user.badges.length + 2)
      .addOptions(
        {
          label: ctx.locale('commands:badges.select-all'),
          value: 'ALL',
          emoji: '⭐',
        },
        {
          label: ctx.locale('commands:badges.diselect-all'),
          value: 'NONE',
          emoji: '⭕',
        },
      );

    ctx.data.user.badges.forEach((a) => {
      const isSelected = ctx.data.user.hiddingBadges.includes(a.id);

      selectMenu.addOptions({
        label: Badges[a.id as 1].name,
        value: `${a.id}`,
        default: isSelected,
        emoji: emojis[`badge_${a.id}` as EmojiTypes],
      });

      embed.addField(
        `${emojis[`badge_${a.id}` as EmojiTypes]} | ${Badges[a.id as 1].name}`,
        ctx.locale('commands:badges.badge-info', {
          unix: Math.floor(Number(a.obtainAt) / 1000),
          description: Badges[a.id as 1].description,
          rarity: Badges[a.id as 1].rarityLevel,
          id: a.id,
        }),
        true,
      );
    });

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selectMenu])] });

    const didSelect = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7500,
    );

    if (!didSelect) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    let toUpdate: number[] = [];

    didSelect.values.forEach((a) => {
      if (a.length <= 2) toUpdate.push(Number(a));
    });

    if (didSelect.values.includes('ALL')) toUpdate = ctx.data.user.badges.map((a) => a.id);

    if (didSelect.values.includes('NONE')) toUpdate = [];

    await ctx.client.repositories.userRepository.update(ctx.author.id, {
      hiddingBadges: toUpdate,
    });

    ctx.makeMessage({
      content: ctx.locale('commands:badges.success'),
      embeds: [],
      components: [],
    });
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
        '7': '⚫',
        '8': '🟤',
        '9': '⚪',
      };

      return colors[color] ?? '🌈';
    };

    if (!haspadrao) {
      ctx.data.user.colors.push({ nome: '0 - Padrão', cor: '#a788ff' });
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

    const pages = Math.floor(ctx.data.user.colors.length / 9) + 1;

    for (let i = 0; i < ctx.data.user.colors.length && i < 9; i++) {
      embed.addField(`${ctx.data.user.colors[i].nome}`, `${ctx.data.user.colors[i].cor}`, true);
      selector.addOptions({
        label: ctx.data.user.colors[i].nome.replaceAll('*', ''),
        value: `${ctx.data.user.colors[i].cor}`,
        description: `${ctx.data.user.colors[i].cor}`,
        emoji: getEmojiFromColorName(ctx.data.user.colors[i].nome.replace(/\D/g, '')),
      });
    }

    const renameButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | RENAME`)
      .setStyle('SECONDARY')
      .setLabel(ctx.locale('commands:cor.rename'));

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

      embed.setFooter({ text: ctx.locale('commands:cor.footer', { page: 1, maxPages: pages }) });
    }

    componentsToSend.push(actionRow([renameButton]));

    // É o cara do arroz

    await ctx.makeMessage({
      embeds: [embed],
      components: componentsToSend,
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.author.id;

    const collector = new InteractionCollector(ctx.client, {
      channel: ctx.channel,
      idle: 20_000,
      filter,
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'selected') ctx.deleteReply();
    });

    let selectedPage = 0;
    let toRename = false;

    collector.on('collect', async (int) => {
      const type = resolveCustomId(int.customId);

      const changePage = (toSum: number, justUpdateEmbed = false) => {
        selectedPage += toSum;

        const currentMenu = componentsToSend[0].components[0] as MessageSelectMenu;

        currentMenu.spliceOptions(0, currentMenu.options.length);
        embed.spliceFields(0, embed.fields.length);

        for (let i = 9 * selectedPage; currentMenu.options.length < 9; i++) {
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

        embed.setFooter({
          text: ctx.locale('commands:cor.footer', { page: selectedPage + 1, maxPages: pages }),
        });

        if (!justUpdateEmbed) {
          if (selectedPage > 0) componentsToSend[1].components[0].setDisabled(false);
          else componentsToSend[1].components[0].setDisabled(true);

          if (selectedPage + 1 === pages) componentsToSend[1].components[1].setDisabled(true);
          else componentsToSend[1].components[1].setDisabled(false);
        }
      };

      switch (type) {
        case 'MODAL': {
          // @ts-expect-error Sim nenem não funciona de certo
          const component = (int as ModalSubmitInteraction).components[0].components[0];
          const newName = component.value;
          const oldColor = component.customId;

          const userColor = ctx.data.user.colors.find((c) => c.cor === oldColor);
          if (!userColor) break;

          if (ctx.data.user.colors.some((a) => a.nome === newName)) {
            int.reply({
              ephemeral: true,
              content: ctx.prettyResponse('error', 'commands:cor.same-name'),
            });
            break;
          }

          userColor.nome = newName;

          await ctx.client.repositories.userRepository.userModal.updateOne(
            {
              id: ctx.author.id,
              'colors.cor': oldColor,
            },
            {
              $set: {
                'colors.$.nome': newName,
              },
            },
          );

          int.reply({
            ephemeral: true,
            content: ctx.prettyResponse('success', 'commands:cor.rename-success', {
              color: oldColor,
              name: newName,
            }),
          });

          changePage(0, true);

          await ctx.makeMessage({
            embeds: [embed],
            components: componentsToSend,
          });

          break;
        }
        case 'RENAME': {
          int.deferUpdate();
          toRename = !toRename;

          (componentsToSend[componentsToSend.length - 1].components[0] as MessageButton).setStyle(
            toRename ? 'SUCCESS' : 'SECONDARY',
          );

          embed.setTitle(
            toRename
              ? ctx.prettyResponse('question', 'commands:cor.select-to-rename')
              : ctx.prettyResponse('gay_flag', 'commands:cor.embed_title'),
          );

          ctx.makeMessage({ components: componentsToSend, embeds: [embed] });
          break;
        }
        case 'SELECT': {
          const selected = (int as SelectMenuInteraction).values[0] as ColorResolvable;

          if (toRename) {
            const modal = new Modal()
              .setCustomId(`${ctx.interaction.id} | MODAL`)
              .setTitle(ctx.locale('commands:cor.modal-title'));

            const nameInput = new TextInputComponent()
              .setCustomId(`${selected}`)
              .setLabel(
                ctx.locale('commands:cor.name-input', {
                  name: ctx.data.user.colors.find((a) => a.cor === selected)?.nome,
                }),
              )
              .setMinLength(2)
              .setMaxLength(20)
              .setStyle('SHORT')
              .setPlaceholder(ctx.locale('commands:loja.buy_colors.name_placeholder'));

            modal.setComponents({ type: 1, components: [nameInput] });

            int.showModal(modal);
            break;
          }
          int.deferUpdate();

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
          collector.stop('selected');
          break;
        }
        case 'NEXT': {
          int.deferUpdate();
          changePage(1);

          await ctx.makeMessage({
            embeds: [embed],
            components: componentsToSend,
          });
          break;
        }
        case 'BACK': {
          int.deferUpdate();
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
