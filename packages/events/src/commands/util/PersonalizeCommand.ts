import {
  ApplicationCommandOptionTypes,
  ButtonComponent,
  ButtonStyles,
  InputTextComponent,
  InteractionResponseTypes,
  SelectMenuComponent,
  TextStyles,
} from 'discordeno/types';
import { AvailableThemeTypes, ThemeFile } from '../../modules/themes/types';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { getThemeById, getUserActiveThemes } from '../../modules/themes/getThemes';
import { IdentifiedData } from '../../types/menhera';
import { getUserAvatar } from '../../utils/discord/userUtils';
import { getUserBadges } from '../../modules/badges/getUserBadges';
import { profileBadges } from '../../modules/badges/profileBadges';
import { collectResponseComponentInteraction } from '../../utils/discord/collectorUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { COLORS, EMOJIS } from '../../structures/constants';
import {
  createActionRow,
  createButton,
  createSelectMenu,
  createTextInput,
  disableComponents,
  generateCustomId,
  resolveCustomId,
} from '../../utils/discord/componentUtils';
import {
  ComponentInteraction,
  ModalInteraction,
  SelectMenuInteraction,
} from '../../types/interaction';
import InteractionCollector from '../../structures/InteractionCollector';
import { bot } from '../../index';
import { usersModel } from '../../database/collections';
import userRepository from '../../database/repositories/userRepository';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import { toWritableUtf } from '../../utils/miscUtils';
import { createCommand } from '../../structures/command/createCommand';
import commandRepository from '../../database/repositories/commandRepository';

const executeAboutMeCommand = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
) => {
  const info = ctx.getOption<string>('frase', false, true);

  await userRepository.updateUser(ctx.author.id, { info: toWritableUtf(info) });

  const commandInfo = await commandRepository.getCommandInfo('perfil');

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:sobremim.success', {
      command: `</perfil:${commandInfo?.discordId}>`,
    }),
  });
  finishCommand();
};

const executeColorCommand = async (ctx: ChatInputInteractionContext, finishCommand: () => void) => {
  if (ctx.authorData.colors.length < 2) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:cor.min-color'),
      flags: MessageFlags.EPHEMERAL,
    });

    return finishCommand();
  }

  const embed = createEmbed({
    title: ctx.prettyResponse('gay_flag', 'commands:cor.embed_title'),
    color: COLORS.Purple,
    description: ctx.locale('commands:cor.embed_description'),
    fields: [],
  });

  const selector = createSelectMenu({
    customId: generateCustomId('SELECT', ctx.interaction.id),
    minValues: 1,
    maxValues: 1,
    placeholder: ctx.prettyResponse('rainbow', 'commands:cor.choose'),
    options: [],
  });

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

  const pages = Math.floor(ctx.authorData.colors.length / 9) + 1;

  for (let i = 0; i < ctx.authorData.colors.length && i < 9; i++) {
    embed.fields?.push({
      name: ctx.authorData.colors[i].nome,
      value: ctx.authorData.colors[i].cor,
      inline: true,
    });

    selector.options.push({
      label: ctx.authorData.colors[i].nome.replaceAll('*', ''),
      value: `${ctx.authorData.colors[i].cor}`,
      description: `${ctx.authorData.colors[i].cor}`,
      emoji: { name: getEmojiFromColorName(ctx.authorData.colors[i].nome.replace(/\D/g, '')) },
    });
  }

  const renameButton = createButton({
    customId: generateCustomId('RENAME', ctx.interaction.id),
    style: ButtonStyles.Secondary,
    label: ctx.locale('commands:cor.rename'),
  });

  const componentsToSend = [createActionRow([selector])];

  if (pages > 1) {
    const nextPageButton = createButton({
      customId: generateCustomId('NEXT', ctx.interaction.id),
      label: ctx.locale('common:next'),
      style: ButtonStyles.Primary,
    });

    const backPageButton = createButton({
      customId: generateCustomId('BACK', ctx.interaction.id),
      label: ctx.locale('common:back'),
      style: ButtonStyles.Primary,
      disabled: true,
    });

    componentsToSend.push(createActionRow([backPageButton, nextPageButton]));

    embed.footer = { text: ctx.locale('commands:cor.footer', { page: 1, maxPages: pages }) };
  }

  componentsToSend.push(createActionRow([renameButton]));

  ctx.makeMessage({ embeds: [embed], components: componentsToSend });

  const filter = (int: ComponentInteraction) => {
    if (typeof int.data.customId === 'undefined') return false;
    return int.data.customId.startsWith(`${ctx.interaction.id}`) && int.user.id === ctx.author.id;
  };

  const collector = new InteractionCollector({
    filter,
    idle: 20_000,
    channelId: ctx.channelId,
  });

  collector.on('end', (_, reason) => {
    if (reason !== 'selected') {
      ctx.makeMessage({
        components: [
          createActionRow(disableComponents(ctx.locale('common:timesup'), [renameButton])),
        ],
      });

      return finishCommand();
    }
  });

  let selectedPage = 0;
  let toRename = false;

  collector.on('collect', async (int: ComponentInteraction) => {
    const type = resolveCustomId(int.data.customId);

    const changePage = (toSum: number, justUpdateEmbed = false) => {
      selectedPage += toSum;

      const currentMenu = componentsToSend[0].components[0] as SelectMenuComponent;

      currentMenu.options = [];
      embed.fields = [];

      for (let i = 9 * selectedPage; currentMenu.options.length < 9; i++) {
        if (i > ctx.authorData.colors.length || typeof ctx.authorData.colors[i] === 'undefined')
          break;

        embed.fields.push({
          name: ctx.authorData.colors[i].nome,
          value: ctx.authorData.colors[i].cor,
          inline: true,
        });

        currentMenu.options.push({
          label: ctx.authorData.colors[i].nome.replaceAll('*', ''),
          value: `${ctx.authorData.colors[i].cor}`,
          description: `${ctx.authorData.colors[i].cor}`,
          emoji: { name: getEmojiFromColorName(ctx.authorData.colors[i].nome.replace(/\D/g, '')) },
        });
      }

      embed.footer = {
        text: ctx.locale('commands:cor.footer', { page: selectedPage + 1, maxPages: pages }),
      };

      if (!justUpdateEmbed) {
        if (selectedPage > 0)
          (componentsToSend[1].components[0] as ButtonComponent).disabled = false;
        else (componentsToSend[1].components[0] as ButtonComponent).disabled = true;

        if (selectedPage + 1 === pages)
          (componentsToSend[1].components[1] as ButtonComponent).disabled = true;
        else (componentsToSend[1].components[1] as ButtonComponent).disabled = false;
      }
    };

    switch (type) {
      case 'MODAL': {
        const component = (int as ModalInteraction).data.components[0]
          .components[0] as InputTextComponent;
        const newName = component.value as string;
        const oldColor = component.customId;

        const userColor = ctx.authorData.colors.find((c) => c.cor === oldColor);
        if (!userColor) break;

        if (ctx.authorData.colors.some((a) => a.nome === newName)) {
          bot.helpers.sendInteractionResponse(int.id, int.token, {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            data: {
              content: ctx.prettyResponse('error', 'commands:cor.same-name'),
              flags: MessageFlags.EPHEMERAL,
            },
          });
          break;
        }

        userColor.nome = newName;

        await usersModel.updateOne(
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

        await userRepository.invalidateUserCache(ctx.author.id);

        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.ChannelMessageWithSource,
          data: {
            content: ctx.prettyResponse('error', 'commands:cor.rename-success', {
              color: oldColor,
              name: newName,
            }),
          },
        });

        changePage(0, true);

        ctx.makeMessage({ embeds: [embed], components: componentsToSend });

        break;
      }
      case 'RENAME': {
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });

        toRename = !toRename;

        (componentsToSend[componentsToSend.length - 1].components[0] as ButtonComponent).style =
          toRename ? ButtonStyles.Success : ButtonStyles.Secondary;

        embed.title = toRename
          ? ctx.prettyResponse('question', 'commands:cor.select-to-rename')
          : ctx.prettyResponse('gay_flag', 'commands:cor.embed_title');

        ctx.makeMessage({ embeds: [embed], components: componentsToSend });
        break;
      }
      case 'SELECT': {
        const selected = (int as SelectMenuInteraction).data.values[0];

        if (toRename) {
          const nameInput = createTextInput({
            customId: selected,
            label: ctx.locale('commands:cor.name-input', {
              name: ctx.authorData.colors.find((a) => a.cor === selected)?.nome,
            }),
            minLength: 2,
            maxLength: 20,
            style: TextStyles.Short,
            placeholder: ctx.locale('commands:loja.buy_colors.name_placeholder'),
          });

          bot.helpers.sendInteractionResponse(int.id, int.token, {
            type: InteractionResponseTypes.Modal,
            data: {
              title: ctx.locale('commands:cor.modal-title'),
              customId: generateCustomId('MODAL', ctx.interaction.id),
              components: [createActionRow([nameInput])],
            },
          });

          break;
        }

        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });

        const dataChooseEmbed = createEmbed({
          title: ctx.locale('commands:cor.dataChoose.title'),
          description: ctx.locale('commands:cor.dataChoose.description'),
          color: hexStringToNumber(selected),
          thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png',
          },
        });

        await userRepository.updateUser(ctx.author.id, {
          selectedColor: selected as `#${string}`,
        });

        ctx.makeMessage({ embeds: [dataChooseEmbed], components: [] });
        collector.stop('selected');
        finishCommand();
        break;
      }
      case 'NEXT': {
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });

        changePage(1);

        ctx.makeMessage({ embeds: [embed], components: componentsToSend });
        break;
      }
      case 'BACK': {
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });

        changePage(-1);

        ctx.makeMessage({ embeds: [embed], components: componentsToSend });
        break;
      }
    }
  });
};

const executeBadgesCommand = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
) => {
  const embed = createEmbed({
    author: { name: ctx.locale('commands:badges.title'), iconUrl: getUserAvatar(ctx.author) },
    footer: { text: ctx.locale('commands:badges.footer') },
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: [],
  });

  const selectMenu = createSelectMenu({
    customId: generateCustomId('SELECT', ctx.interaction.id),
    minValues: 1,
    options: [
      {
        label: ctx.locale('commands:badges.select-all'),
        value: 'ALL',
        emoji: { name: '⭐' },
      },
      {
        label: ctx.locale('commands:badges.diselect-all'),
        value: 'NONE',
        emoji: { name: '⭕' },
      },
    ],
  });

  const extractNameAndIdFromEmoji = (emoji: string) => {
    const splitted = emoji.split(':');

    return {
      name: splitted[1],
      id: BigInt(splitted[2].slice(0, -1)),
    };
  };

  getUserBadges(ctx.authorData, ctx.author).forEach((a) => {
    const isSelected = ctx.authorData.hiddingBadges.includes(a.id);

    selectMenu.options.push({
      label: profileBadges[a.id as 1].name,
      value: `${a.id}`,
      default: isSelected,
      emoji: extractNameAndIdFromEmoji(EMOJIS[`badge_${a.id}` as 'angels']),
    });

    embed.fields?.push({
      name: `${EMOJIS[`badge_${a.id}` as 'angels']} | ${profileBadges[a.id as 1].name}`,
      value: ctx.locale('commands:badges.badge-info', {
        unix: Math.floor(Number(a.obtainAt) / 1000),
        description: profileBadges[a.id as 1].description,
        rarity: profileBadges[a.id as 1].rarityLevel,
        id: a.id,
      }),
      inline: true,
    });
  });

  selectMenu.maxValues = selectMenu.options.length;

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([selectMenu])] });

  const selection = await collectResponseComponentInteraction<SelectMenuInteraction>(
    ctx.channelId,
    ctx.author.id,
    `${ctx.interaction.id}`,
    13_000,
  );

  if (!selection) {
    ctx.makeMessage({
      components: [createActionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
    });

    return finishCommand();
  }

  let toUpdate: number[] = [];

  selection.data.values.forEach((a) => {
    if (a.length < 2) toUpdate.push(Number(a));
  });

  if (selection.data.values.includes('ALL')) toUpdate = ctx.authorData.badges.map((a) => a.id);

  if (selection.data.values.includes('NONE')) toUpdate = [];

  await userRepository.updateUser(ctx.author.id, {
    hiddingBadges: toUpdate as 1[],
  });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:badges.success'),
    components: [],
    embeds: [],
  });

  finishCommand();
};

const executeThemesCommand = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
) => {
  const themeType = ctx.getOption<AvailableThemeTypes>('tipo', false, true);

  const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.author.id);

  const embed = createEmbed({
    color: hexStringToNumber(ctx.authorData.selectedColor),
    title: ctx.locale(`commands:temas.${themeType}`),
    fields: [],
  });

  const selectMenu = createSelectMenu({
    customId: generateCustomId('SELECT', ctx.interaction.id),
    minValues: 1,
    maxValues: 1,
    options: [],
  });

  const availableThemes = getUserActiveThemes(userThemes).reduce<Array<IdentifiedData<ThemeFile>>>(
    (p, c) => {
      if (c.inUse) return p;

      const theme = getThemeById(c.id);

      if (theme.data.type !== themeType) return p;

      p.push(theme);

      selectMenu.options.push({
        label: ctx.locale(`data:themes.${c.id as 1}.name`),
        value: `${c.id}`,
        description: ctx.locale(`data:themes.${c.id as 1}.description`).substring(0, 100),
      });

      embed.fields?.push({
        name: ctx.locale(`data:themes.${c.id as 1}.name`),
        value: ctx.locale(`data:themes.${c.id as 1}.description`),
        inline: true,
      });

      return p;
    },
    [],
  );

  if (availableThemes.length === 0) {
    embed.description = ctx.locale('commands:temas.no-themes');
    ctx.makeMessage({ embeds: [embed] });

    return finishCommand();
  }

  ctx.makeMessage({ embeds: [embed], components: [createActionRow([selectMenu])] });

  const collected = await collectResponseComponentInteraction<SelectMenuInteraction>(
    ctx.channelId,
    ctx.author.id,
    `${ctx.interaction.id}`,
    10_000,
  );

  if (!collected) {
    ctx.makeMessage({
      components: [createActionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
    });

    return finishCommand();
  }

  const themeId = Number(collected.data.values[0]);

  switch (themeType) {
    case 'cards':
      userThemesRepository.setCardsTheme(ctx.author.id, themeId);
      break;
    case 'card_background':
      userThemesRepository.setCardBackgroundTheme(ctx.author.id, themeId);
      break;
    case 'profile':
      userThemesRepository.setProfileTheme(ctx.author.id, themeId);
      break;
    case 'table':
      userThemesRepository.setTableTheme(ctx.author.id, themeId);
      break;
    case 'eb_background':
      userThemesRepository.setEbBackgroundTheme(ctx.author.id, themeId);
      break;
    case 'eb_text_box':
      userThemesRepository.setEbTextBoxTheme(ctx.author.id, themeId);
      break;
    case 'eb_menhera':
      userThemesRepository.setEbMenheraTheme(ctx.author.id, themeId);
      break;
  }

  ctx.makeMessage({
    components: [],
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:temas.selected'),
  });
  finishCommand();
};

const PersonalizeCommand = createCommand({
  path: '',
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
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          type: ApplicationCommandOptionTypes.String,
          name: 'frase',
          nameLocalizations: { 'en-US': 'phrase' },
          description: 'Frase para colocar em seu sobre mim. No máximo 120 caracteres',
          descriptionLocalizations: {
            'en-US': 'Phrase to put in your about me. Maximum 120 characters',
          },
          maxLength: 120,
          required: true,
        },
      ],
    },
    {
      name: 'cor',
      nameLocalizations: { 'en-US': 'color' },
      description: '「🌈」・Muda a cor base da sua conta',
      descriptionLocalizations: { 'en-US': '「🌈」・Change your account base color' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'temas',
      nameLocalizations: { 'en-US': 'themes' },
      description: '「🎊」・Personalize os temas da sua conta!',
      descriptionLocalizations: { 'en-US': '「🎊」・Customize your account themes!' },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          name: 'tipo',
          nameLocalizations: { 'en-US': 'type' },
          description: 'O tipo de tema que você quer alterar',
          descriptionLocalizations: { 'en-US': 'The type of theme you want to change' },
          type: ApplicationCommandOptionTypes.String,
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
            {
              name: '🏞️ | Fundo do 8ball',
              nameLocalizations: { 'en-US': '🏞️ | 8ball Background' },
              value: 'eb_background',
            },
            {
              name: '❓ | Caixa de Pergunta do 8ball',
              nameLocalizations: { 'en-US': '❓ | 8ball Question Box' },
              value: 'eb_text_box',
            },
            {
              name: '🤖 | Menhera do 8ball',
              nameLocalizations: { 'en-US': '🤖 | 8ball Menhera' },
              value: 'eb_menhera',
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
      type: ApplicationCommandOptionTypes.SubCommand,
    },
  ],
  category: 'util',
  authorDataFields: [
    'selectedColor',
    'colors',
    'info',
    'badges',
    'hiddingBadges',
    'voteCooldown',
    'married',
  ],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    if (command === 'sobre_mim') return executeAboutMeCommand(ctx, finishCommand);

    if (command === 'cor') return executeColorCommand(ctx, finishCommand);

    if (command === 'temas') return executeThemesCommand(ctx, finishCommand);

    if (command === 'badges') return executeBadgesCommand(ctx, finishCommand);
  },
});

export default PersonalizeCommand;
