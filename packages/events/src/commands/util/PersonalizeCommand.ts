import { Embed } from 'discordeno/transformers';
import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonStyles,
  InputTextComponent,
  SelectMenuComponent,
  TextStyles,
} from 'discordeno/types';

import md5 from 'md5';
import { usersModel } from '../../database/collections';
import commandRepository from '../../database/repositories/commandRepository';
import profileImagesRepository from '../../database/repositories/profileImagesRepository';
import userRepository from '../../database/repositories/userRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { getUserBadges } from '../../modules/badges/getUserBadges';
import { profileBadges } from '../../modules/badges/profileBadges';
import { previewProfileData } from '../../modules/shop/constants';
import { getThemeById, getUserActiveThemes } from '../../modules/themes/getThemes';
import { AvailableThemeTypes, ProfileTheme, ThemeFile } from '../../modules/themes/types';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext';
import { createCommand } from '../../structures/command/createCommand';
import { COLORS, EMOJIS } from '../../structures/constants';
import { UserColor } from '../../types/database';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction';
import { IdentifiedData } from '../../types/menhera';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
  createTextInput,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags, extractNameAndIdFromEmoji } from '../../utils/discord/messageUtils';
import { getDisplayName, getUserAvatar } from '../../utils/discord/userUtils';
import { getCustomThemeField, toWritableUtf } from '../../utils/miscUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';

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

const createColorComponents = (
  ctx: ComponentInteractionContext | ChatInputInteractionContext,
  userColors: UserColor[],
  currentPage: number,
  toRename: boolean,
): [Embed, ActionRow[]] => {
  const embed = createEmbed({
    title: toRename
      ? ctx.prettyResponse('question', 'commands:cor.select-to-rename')
      : ctx.prettyResponse('gay_flag', 'commands:cor.embed_title'),
    color: COLORS.Purple,
    description: ctx.locale('commands:cor.embed_description'),
    fields: [],
  });

  const selector = createSelectMenu({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.commandId,
      'SELECT',
      currentPage,
      toRename,
    ),
    minValues: 1,
    maxValues: 1,
    placeholder: `${EMOJIS.rainbow} ${ctx.locale('commands:cor.choose')}`,
    options: [],
  });

  for (let i = 9 * currentPage; selector.options.length < 9; i++) {
    if (i > userColors.length || typeof userColors[i] === 'undefined') break;
    embed.fields?.push({
      name: userColors[i].nome,
      value: userColors[i].cor,
      inline: true,
    });

    selector.options.push({
      label: userColors[i].nome.replaceAll('*', ''),
      value: `${userColors[i].cor}`,
      description: `${userColors[i].cor}`,
      emoji: { name: getEmojiFromColorName(userColors[i].nome.replace(/\D/g, '')) },
    });
  }

  const pages = Math.floor(userColors.length / 10) + 1;

  const componentsToSend = [createActionRow([selector])];

  if (pages > 1) {
    const nextPageButton = createButton({
      customId: createCustomId(
        2,
        ctx.interaction.user.id,
        ctx.commandId,
        'NEXT',
        currentPage,
        toRename,
      ),
      label: ctx.locale('common:next'),
      disabled: currentPage + 1 === pages,
      style: ButtonStyles.Primary,
    });

    const backPageButton = createButton({
      customId: createCustomId(
        2,
        ctx.interaction.user.id,
        ctx.commandId,
        'BACK',
        currentPage,
        toRename,
      ),
      label: ctx.locale('common:back'),
      style: ButtonStyles.Primary,
      disabled: currentPage === 0,
    });

    embed.footer = {
      text: ctx.locale('commands:cor.footer', { page: currentPage + 1, maxPages: pages }),
    };

    componentsToSend.push(createActionRow([backPageButton, nextPageButton]));
  }

  const renameButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.commandId,
      'RENAME',
      currentPage,
      toRename,
    ),
    style: toRename ? ButtonStyles.Success : ButtonStyles.Secondary,
    label: ctx.locale('commands:cor.rename'),
  });

  componentsToSend.push(createActionRow([renameButton]));

  return [embed, componentsToSend];
};

const executeColorComponents = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  const [type, sentCurrentPage, sentToRename] = ctx.sentData;

  const currentPage = Number(sentCurrentPage);
  const toRename = sentToRename === 'true';

  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  const pages = Math.floor(authorData.colors.length / 9) + 1;

  const changePage = (toSum: number, rename: boolean) => {
    const selectedPage = currentPage + toSum;

    const [embed, componentsToSend] = createColorComponents(
      ctx,
      authorData.colors,
      selectedPage,
      rename,
    );

    embed.footer = {
      text: ctx.locale('commands:cor.footer', { page: selectedPage + 1, maxPages: pages }),
    };

    ctx.makeMessage({ embeds: [embed], components: componentsToSend });
  };

  switch (type) {
    case 'MODAL': {
      const component = (ctx.interaction as ModalInteraction).data.components[0]
        .components[0] as InputTextComponent;
      const newName = component.value as string;
      const oldColor = component.customId;

      const userColor = authorData.colors.find((c) => c.cor === oldColor);

      if (!userColor) {
        return ctx.respondInteraction({
          content: ctx.prettyResponse('error', 'commands:cor.nonexistent'),
          flags: MessageFlags.EPHEMERAL,
        });
      }

      if (authorData.colors.some((a) => a.nome === newName)) {
        ctx.respondInteraction({
          content: ctx.prettyResponse('error', 'commands:cor.same-name'),
          flags: MessageFlags.EPHEMERAL,
        });

        break;
      }

      userColor.nome = newName;

      await usersModel.updateOne(
        {
          id: ctx.user.id,
          'colors.cor': oldColor,
        },
        {
          $set: {
            'colors.$.nome': newName,
          },
        },
      );

      await userRepository.invalidateUserCache(ctx.user.id);

      await ctx.respondInteraction({
        content: ctx.prettyResponse('success', 'commands:cor.rename-success', {
          color: oldColor,
          name: newName,
        }),
        flags: MessageFlags.EPHEMERAL,
      });

      break;
    }
    case 'RENAME': {
      changePage(0, !toRename);
      break;
    }
    case 'SELECT': {
      const selected = ctx.interaction.data.values[0];

      if (toRename) {
        const nameInput = createTextInput({
          customId: selected,
          label: ctx.locale('commands:cor.name-input', {
            name: authorData.colors.find((a) => a.cor === selected)?.nome,
          }),
          minLength: 2,
          maxLength: 20,
          style: TextStyles.Short,
          placeholder: ctx.locale('commands:loja.buy_colors.name_placeholder'),
        });

        ctx.respondWithModal({
          title: ctx.locale('commands:cor.modal-title'),
          customId: createCustomId(2, ctx.user.id, ctx.commandId, 'MODAL', currentPage, toRename),
          components: [createActionRow([nameInput])],
        });

        break;
      }

      const dataChooseEmbed = createEmbed({
        title: ctx.locale('commands:cor.dataChoose.title'),
        description: ctx.locale('commands:cor.dataChoose.description'),
        color: hexStringToNumber(selected),
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
      });

      await userRepository.updateUser(ctx.user.id, {
        selectedColor: selected as `#${string}`,
      });

      ctx.makeMessage({ embeds: [dataChooseEmbed], components: [] });
      break;
    }
    case 'NEXT': {
      changePage(1, toRename);
      break;
    }
    case 'BACK': {
      changePage(-1, toRename);
      break;
    }
  }
};

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

const executeColorCommand = async (ctx: ChatInputInteractionContext, finishCommand: () => void) => {
  const haspadrao = ctx.authorData.colors.some((pc) => pc.cor === `#a788ff`);
  if (!haspadrao) ctx.authorData.colors.push({ nome: '0 - Padrão', cor: '#a788ff' });

  if (ctx.authorData.colors.length < 2) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:cor.min-color'),
      flags: MessageFlags.EPHEMERAL,
    });

    return finishCommand();
  }

  const [embed, componentsToSend] = createColorComponents(ctx, ctx.authorData.colors, 0, false);

  ctx.makeMessage({
    embeds: [embed],
    components: componentsToSend,
  });

  finishCommand();
};

const executeSelectedImageComponent = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
) => {
  const selectedImage = Number(ctx.interaction.data.values[0]);

  await userThemesRepository.setProfileImage(ctx.user.id, selectedImage);

  ctx.makeMessage({
    components: [],
    content: ctx.prettyResponse('success', 'commands:imagem.success'),
  });
};

const executeImageCommand = async (ctx: ChatInputInteractionContext, finishCommand: () => void) => {
  const authorData = await userThemesRepository.findEnsuredUserThemes(ctx.author.id);

  if (!authorData.profileImages.some((a) => a.id === 1))
    authorData.profileImages.push({ id: 1, aquiredAt: 0 });

  if (authorData.profileImages.length < 2) {
    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:imagem.min-image'),
      flags: MessageFlags.EPHEMERAL,
    });

    return finishCommand();
  }

  const selectMenu = createSelectMenu({
    customId: createCustomId(3, ctx.author.id, ctx.commandId),
    options: await Promise.all(
      authorData.profileImages.map(async (img) => ({
        label: await profileImagesRepository.getImageName(img.id),
        value: `${img.id}`,
        default: img.id === authorData.selectedImage,
      })),
    ),
    maxValues: 1,
    minValues: 1,
    placeholder: ctx.locale('commands:imagem.select'),
  });

  ctx.makeMessage({
    content: ctx.prettyResponse('question', 'commands:imagem.message'),
    components: [createActionRow([selectMenu])],
  });

  finishCommand();
};

const executeBadgesSelected = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
): Promise<void> => {
  let toUpdate: number[] = [];

  ctx.interaction.data.values.forEach((a) => {
    if (a.length <= 2) toUpdate.push(Number(a));
  });

  if (
    ctx.interaction.data.values.includes('ALL') &&
    !ctx.interaction.data.values.includes('NONE')
  ) {
    const authorData = await userRepository.ensureFindUser(ctx.user.id);
    const userBadges = getUserBadges(authorData, ctx.user);
    toUpdate = userBadges.map((a) => a.id);
  }

  if (ctx.interaction.data.values.includes('NONE')) toUpdate = [];

  await userRepository.updateUser(ctx.user.id, {
    hiddingBadges: toUpdate as 1[],
  });

  ctx.makeMessage({
    content: ctx.prettyResponse('success', 'commands:badges.success'),
    components: [],
    embeds: [],
  });
};

const executeBadgesCommand = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
) => {
  const toSendEmbeds: Embed[] = [
    createEmbed({
      author: { name: ctx.locale('commands:badges.title'), iconUrl: getUserAvatar(ctx.author) },
      footer: { text: ctx.locale('commands:badges.footer') },
      color: hexStringToNumber(ctx.authorData.selectedColor),
      fields: [],
    }),
  ];

  const selectMenu = createSelectMenu({
    customId: createCustomId(0, ctx.author.id, ctx.commandId, 'SELECT'),
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

  const userBadges = getUserBadges(ctx.authorData, ctx.author);

  if (userBadges.length > 9)
    toSendEmbeds.push(
      createEmbed({ color: hexStringToNumber(ctx.authorData.selectedColor), fields: [] }),
    );

  userBadges.forEach((a, i) => {
    const isSelected = ctx.authorData.hiddingBadges.includes(a.id);

    if (!selectMenu.options.some((b) => b.value === `${a.id}`))
      selectMenu.options.push({
        label: profileBadges[a.id as 1].name,
        value: `${a.id}`,
        default: isSelected,
        emoji: extractNameAndIdFromEmoji(EMOJIS[`badge_${a.id}` as 'angels']),
      });

    toSendEmbeds[i < 9 ? 0 : 1].fields?.push({
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

  ctx.makeMessage({ embeds: toSendEmbeds, components: [createActionRow([selectMenu])] });

  finishCommand();
};

const selectedThemeToUse = async (ctx: ComponentInteractionContext<SelectMenuInteraction>) => {
  const themeId = Number(ctx.interaction.data.values[0]);

  const componentsToSend = [];

  const [themeType] = ctx.sentData;

  switch (themeType) {
    case 'profile': {
      userThemesRepository.setProfileTheme(ctx.user.id, themeId);

      const themeData = getThemeById<ProfileTheme>(themeId);

      if (themeData.data.customEdits && themeData.data.customEdits.length > 0) {
        componentsToSend.push(
          createActionRow([
            createButton({
              label: ctx.locale('commands:temas.edit-profile.customize'),
              style: ButtonStyles.Primary,
              customId: createCustomId(4, ctx.user.id, ctx.commandId, 'CUSTOM'),
            }),
          ]),
        );
      }
      break;
    }
    case 'cards':
      userThemesRepository.setCardsTheme(ctx.user.id, themeId);
      break;
    case 'card_background':
      userThemesRepository.setCardBackgroundTheme(ctx.user.id, themeId);
      break;
    case 'table':
      userThemesRepository.setTableTheme(ctx.user.id, themeId);
      break;
    case 'eb_background':
      userThemesRepository.setEbBackgroundTheme(ctx.user.id, themeId);
      break;
    case 'eb_text_box':
      userThemesRepository.setEbTextBoxTheme(ctx.user.id, themeId);
      break;
    case 'eb_menhera':
      userThemesRepository.setEbMenheraTheme(ctx.user.id, themeId);
      break;
  }

  ctx.makeMessage({
    components: componentsToSend,
    embeds: [],
    content: ctx.prettyResponse('success', 'commands:temas.selected'),
  });
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
    customId: createCustomId(1, ctx.author.id, ctx.commandId, themeType),
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

  const componentsToSend = [createActionRow([selectMenu])];

  if (themeType === 'profile') {
    const themeData = getThemeById<ProfileTheme>(userThemes.selectedProfileTheme);

    if (themeData.data.customEdits && themeData.data.customEdits.length > 0)
      componentsToSend.push(
        createActionRow([
          createButton({
            label: ctx.locale('commands:temas.edit-profile.customize'),
            style: ButtonStyles.Primary,
            customId: createCustomId(4, ctx.author.id, ctx.commandId, 'CUSTOM'),
          }),
        ]),
      );
  }

  ctx.makeMessage({ embeds: [embed], components: componentsToSend });
  finishCommand();
};

const createCustomizeMessage = async (
  ctx: ComponentInteractionContext,
  useDbCustomized: boolean,
): Promise<void> => {
  const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
  const currentTheme = getThemeById<ProfileTheme>(userThemes.selectedProfileTheme);

  if (!currentTheme.data.customEdits || currentTheme.data.customEdits.length === 0)
    return ctx.makeMessage({
      components: [],
      embeds: [],
      content: ctx.prettyResponse('error', 'commands:temas.edit-profile.not-customizable'),
    });

  const fieldToUse = useDbCustomized
    ? userThemes.customizedProfile
    : currentTheme.data.customEdits
        .map((a) => {
          const sentValues = ctx.interaction.data.values ?? [];

          const found = sentValues.some((b) => b.includes(a));

          if (found) return [a, 'true'];

          return [a, 'false'];
        })
        .flat();

  const embed = createEmbed({
    title: ctx.prettyResponse('wink', 'commands:temas.edit-profile.title', {
      theme: ctx.locale(`data:themes.${userThemes.selectedProfileTheme as 1}.name`),
    }),
    color: hexStringToNumber((await userRepository.ensureFindUser(ctx.user.id)).selectedColor),
    footer: { text: ctx.locale('commands:temas.edit-profile.footer') },
    description: currentTheme.data.customEdits
      .map(
        (field) =>
          `${ctx.locale(
            `data:themes.${currentTheme.id as 30}.customFields.${field as 'textBoxFilled'}`,
          )}: ${ctx.locale(`common:${getCustomThemeField(field, fieldToUse)}`)}`,
      )
      .join('\n'),
  });

  const selectMenu = createSelectMenu({
    customId: createCustomId(4, ctx.user.id, ctx.commandId, 'SELECT'),
    minValues: 0,
    maxValues: currentTheme.data.customEdits.length,
    options: currentTheme.data.customEdits.map((field) => ({
      label: ctx.locale(
        `data:themes.${currentTheme.id as 30}.customFields.${field as 'textBoxFilled'}`,
      ),
      value: `${field}|${getCustomThemeField(field, fieldToUse)}`,
      emoji: {
        name: ctx.locale(`common:${getCustomThemeField(field, fieldToUse)}`),
      },
      default: getCustomThemeField(field, fieldToUse),
    })),
  });

  const saveButton = createButton({
    customId: createCustomId(4, ctx.user.id, ctx.commandId, 'SAVE'),
    label: ctx.locale('commands:temas.edit-profile.save'),
    style: ButtonStyles.Primary,
  });

  await ctx.ack();

  const userData = await userRepository.ensureFindUser(ctx.user.id);

  const res = await vanGoghRequest(VanGoghEndpoints.Profile, {
    user: {
      id: userData.id,
      color: userData.selectedColor,
      avatar: getUserAvatar(ctx.user, { size: 512 }),
      votes: userData.votes,
      info: userData.info,
      tag: toWritableUtf(getDisplayName(ctx.user)),
      badges: getUserBadges(userData, ctx.user).map((a) => a.id),
      username: toWritableUtf(ctx.user.username),
      marryDate: userData.marriedDate as string,
      mamadas: userData.mamado,
      mamou: userData.mamou,
      hiddingBadges: userData.hiddingBadges,
      marry: null,
      married: false,
      customizedProfile: fieldToUse,
    },
    i18n: {
      aboutme: ctx.locale('commands:perfil.about-me'),
      mamado: ctx.locale('commands:perfil.mamado'),
      mamou: ctx.locale('commands:perfil.mamou'),
      usages: ctx.locale('commands:perfil.commands-usage', {
        user: previewProfileData.user.username,
        usedCount: previewProfileData.usageCommands.cmds.count,
        mostUsedCommandName: previewProfileData.usageCommands.array[0].name,
        mostUsedCommandCount: previewProfileData.usageCommands.array[0].count,
      }),
    },
    hashedData: md5(`${currentTheme.data.theme}-${JSON.stringify(previewProfileData.user)}`),
    type: currentTheme.data.theme,
  });

  let toSendFile;

  if (!res.err) {
    embed.image = { url: 'attachment://profile.png' };
    toSendFile = {
      name: 'profile.png',
      blob: res.data,
    };
  }

  await ctx.makeMessage({
    components: [createActionRow([selectMenu]), createActionRow([saveButton])],
    content: '',
    file: toSendFile,
    attachments: typeof toSendFile === 'undefined' ? [] : undefined,
    embeds: [embed],
  });
};

const customizeProfileTheme = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [type] = ctx.sentData;

  if (type === 'CUSTOM') return createCustomizeMessage(ctx, true);

  if (type === 'SELECT') return createCustomizeMessage(ctx, false);

  if (type === 'SAVE') {
    const data = (
      (ctx.interaction.message?.components as ActionRow[])[0]?.components[0] as SelectMenuComponent
    ).options
      .map((a) => {
        const splitted = a.value.split('|');

        return [splitted[0], splitted[1]];
      })
      .flat();

    await userThemesRepository.setCustomizedProfile(ctx.user.id, data);

    ctx.makeMessage({
      components: [],
      embeds: [],
      attachments: [],
      content: ctx.prettyResponse('success', 'commands:temas.edit-profile.success'),
    });
  }
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
      name: 'imagem',
      nameLocalizations: { 'en-US': 'image' },
      description: '「🏞️」・Muda a imagem do seu perfil',
      descriptionLocalizations: { 'en-US': '「🏞️」・Change your profile image' },
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
  commandRelatedExecutions: [
    executeBadgesSelected,
    selectedThemeToUse,
    executeColorComponents,
    executeSelectedImageComponent,
    customizeProfileTheme,
  ],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    if (command === 'sobre_mim') return executeAboutMeCommand(ctx, finishCommand);

    if (command === 'cor') return executeColorCommand(ctx, finishCommand);

    if (command === 'imagem') return executeImageCommand(ctx, finishCommand);

    if (command === 'temas') return executeThemesCommand(ctx, finishCommand);

    if (command === 'badges') return executeBadgesCommand(ctx, finishCommand);
  },
});

export default PersonalizeCommand;
