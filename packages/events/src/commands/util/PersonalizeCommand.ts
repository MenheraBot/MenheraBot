import type {
  ApplicationCommandOptionChoice,
  ContainerComponent,
  DiscordEmbed,
} from '@discordeno/bot';
import * as Sentry from '@sentry/node';
import {
  ActionRow,
  ApplicationCommandOptionTypes,
  ButtonStyles,
  TextInputComponent,
  StringSelectComponent,
  TextStyles,
} from '@discordeno/bot';

import md5 from 'md5';
import { findBestMatch } from 'string-similarity';
import i18next from 'i18next';
import { usersModel } from '../../database/collections.js';
import commandRepository from '../../database/repositories/commandRepository.js';
import profileImagesRepository from '../../database/repositories/profileImagesRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import userThemesRepository from '../../database/repositories/userThemesRepository.js';
import { getUserBadges } from '../../modules/badges/getUserBadges.js';
import { profileBadges } from '../../modules/badges/profileBadges.js';
import { previewProfileData } from '../../modules/shop/constants.js';
import { getThemeById, getUserActiveThemes } from '../../modules/themes/getThemes.js';
import { AvailableThemeTypes, ProfileTheme, ThemeFile } from '../../modules/themes/types.js';
import { getProfileImageUrl } from '../../structures/cdnManager.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { COLORS, EMOJIS } from '../../structures/constants.js';
import { DatabaseUserSchema, UserColor } from '../../types/database.js';
import { ModalInteraction, SelectMenuInteraction } from '../../types/interaction.js';
import { IdentifiedData, InteractionContext } from '../../types/menhera.js';
import {
  createActionRow,
  createButton,
  createContainer,
  createCustomId,
  createMediaGallery,
  createSection,
  createSelectMenu,
  createSeparator,
  createTextDisplay,
  createTextInput,
} from '../../utils/discord/componentUtils.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import {
  MessageFlags,
  extractNameAndIdFromEmoji,
  setComponentsV2Flag,
} from '../../utils/discord/messageUtils.js';
import { getDisplayName, getUserAvatar, mentionUser } from '../../utils/discord/userUtils.js';
import {
  ensureUserHaveDefaultThemes,
  getCustomThemeField,
  isUndefined,
  millisToSeconds,
  toWritableUtf,
} from '../../utils/miscUtils.js';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest.js';
import titlesRepository from '../../database/repositories/titlesRepository.js';
import { getOptionFromInteraction } from '../../structures/command/getCommandOption.js';
import { respondWithChoices } from '../../utils/discord/interactionRequests.js';
import { VangoghUserprofileData } from '../info/ProfileCommand.js';
import { logger } from '../../utils/logger.js';
import { bot } from '../../index.js';
import { AvailableLanguages } from '../../types/i18next.js';
import { Interaction, User } from '../../types/discordeno.js';

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
): [DiscordEmbed, ActionRow[]] => {
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
      ctx.originalInteractionId,
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
    if (i > userColors.length || isUndefined(userColors[i])) break;
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
        ctx.originalInteractionId,
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
        ctx.originalInteractionId,
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
      ctx.originalInteractionId,
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
        .components[0] as TextInputComponent;
      const newName = component.value as string;
      const oldColor = component.customId;

      const userColor = authorData.colors.find((c) => c.cor === oldColor);

      if (newName.length < 2)
        return ctx.respondInteraction({
          content: ctx.prettyResponse('error', 'commands:loja.buy_colors.min-color-name'),
          flags: MessageFlags.Ephemeral,
        });

      if (!userColor) {
        return ctx.respondInteraction({
          content: ctx.prettyResponse('error', 'commands:cor.nonexistent'),
          flags: MessageFlags.Ephemeral,
        });
      }

      if (authorData.colors.some((a) => a.nome === newName)) {
        ctx.respondInteraction({
          content: ctx.prettyResponse('error', 'commands:cor.same-name'),
          flags: MessageFlags.Ephemeral,
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
        flags: MessageFlags.Ephemeral,
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
          customId: createCustomId(
            2,
            ctx.user.id,
            ctx.originalInteractionId,
            'MODAL',
            currentPage,
            toRename,
          ),
          components: [createActionRow([nameInput])],
        });

        break;
      }

      const dataChooseEmbed = createEmbed({
        title: ctx.locale('commands:cor.dataChoose.title'),
        description: ctx.locale('commands:cor.dataChoose.description'),
        color: hexStringToNumber(selected),
        thumbnail: {
          url: `${bot.cdnUrl}/images/internal/wink.png`,
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
  const colors: Record<string, string> = {
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
      flags: MessageFlags.Ephemeral,
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
      flags: MessageFlags.Ephemeral,
    });

    return finishCommand();
  }

  const selectMenu = createSelectMenu({
    customId: createCustomId(3, ctx.author.id, ctx.originalInteractionId),
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

const resetTitle: ApplicationCommandOptionChoice = {
  name: '⭕ Remover título',
  value: 0,
  nameLocalizations: { 'en-US': '⭕ Remove title' },
};

export const executeTituleAutocompleteInteraction = async (
  interaction: Interaction,
): Promise<undefined | null> => {
  const input = getOptionFromInteraction<string>(interaction, 'título', false, true);

  if (`${input}`.length < 3) return respondWithChoices(interaction, [resetTitle]);

  const userData = await userRepository.ensureFindUser(interaction.user.id);

  if (userData.titles.length === 0)
    return respondWithChoices(interaction, [
      resetTitle,
      {
        value: 0,
        name: i18next.getFixedT('pt-BR')('commands:titulo.no-titles-autocomplete'),
        nameLocalizations: {
          'en-US': i18next.getFixedT('en-US')('commands:titulo.no-titles-autocomplete'),
        },
      },
    ]);

  const userTitles = await titlesRepository.getTitles(
    interaction.user.id,
    userData.titles.map((a) => a.id),
  );

  if (!userTitles.every((a) => a) || userTitles.length === 0) {
    logger.error(
      `UserTitles is invalid, even when user has titles:`,
      JSON.stringify({ userTitles, fromData: userData.titles }),
    );

    return respondWithChoices(interaction, [resetTitle]);
  }

  try {
    const ratings = findBestMatch(
      `${input}`,
      userTitles.map(
        (a) => a.textLocalizations?.[interaction.locale as AvailableLanguages] ?? a.text,
      ),
    ).ratings.reduce<ApplicationCommandOptionChoice[]>(
      (p, c) => {
        if (p.length >= 23 || c.rating < 0.3) return p;

        const title = userTitles.find(
          (a) => a.text === c.target || a.textLocalizations?.['en-US'] === c.target,
        );

        if (!title) return p;

        p.push({
          name: title.text,
          nameLocalizations: title.textLocalizations ?? undefined,
          value: title.titleId,
        });

        return p;
      },
      [resetTitle],
    );

    return respondWithChoices(interaction, ratings);
  } catch (e) {
    logger.error(`Error in title autocomplete`, input, userTitles);
    logger.info(bot, 'UserTitles', userTitles, 'UserDataTitles', userData.titles);

    Sentry.captureException(e, {
      contexts: {
        infos: {
          input,
          userTitles,
        },
      },
    });
  }
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

const executeTitleCommand = async (ctx: ChatInputInteractionContext): Promise<void> => {
  const user = ctx.getOption<User>('usuário', 'users', false) ?? ctx.author;
  const titleId = ctx.getOption<number>('título', false, false);

  if (isUndefined(titleId)) {
    const userData =
      user.id === ctx.user.id ? ctx.authorData : await userRepository.ensureFindUser(user.id);

    if (userData.titles.length === 0)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:titulo.no-titles', {
          user: mentionUser(user.id),
        }),
      });

    const allTitles = await titlesRepository.getTitles(
      user.id,
      userData.titles.map((a) => a.id),
    );

    if (allTitles.length === 0)
      return ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:titulo.no-titles', {
          user: mentionUser(user.id),
        }),
      });

    const embed = createEmbed({
      author: {
        name: ctx.locale('commands:titulo.title', { user: getDisplayName(user) }),
        iconUrl: getUserAvatar(user),
      },
      description: allTitles
        .map(
          (title) =>
            `- ${title.textLocalizations?.[ctx.interactionLocale] ?? title.text} - <t:${millisToSeconds(
              userData.titles.find((a) => a.id === title.titleId)?.aquiredAt ?? 0,
            )}>`,
        )
        .join('\n'),
      footer: { text: ctx.locale('commands:titulo.footer') },
      color: hexStringToNumber(userData.selectedColor),
      fields: [],
    });

    return ctx.makeMessage({ embeds: [embed] });
  }

  if (titleId === 0) {
    await userRepository.updateUser(ctx.user.id, {
      currentTitle: 0,
    });

    return ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:titulo.success') });
  }

  if (!ctx.authorData.titles.some((a) => a.id === titleId))
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:titulo.not-your-title'),
    });

  const title = await titlesRepository.getTitleInfo(titleId);

  if (!title)
    return ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:titulo.unknown-title'),
    });

  await userRepository.updateUser(ctx.user.id, {
    currentTitle: titleId,
  });

  ctx.makeMessage({ content: ctx.prettyResponse('success', 'commands:titulo.success') });
};

const executeBadgesCommand = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
) => {
  const user = ctx.getOption<User>('usuário', 'users', false) ?? ctx.author;
  const userData =
    user.id === ctx.user.id ? ctx.authorData : await userRepository.ensureFindUser(user.id);

  const toSendEmbeds: DiscordEmbed[] = [
    createEmbed({
      author: {
        name: ctx.locale('commands:badges.title', { user: getDisplayName(user) }),
        iconUrl: getUserAvatar(user),
      },
      footer: { text: ctx.locale('commands:badges.footer') },
      color: hexStringToNumber(userData.selectedColor),
      fields: [],
    }),
  ];

  const selectMenu = createSelectMenu({
    customId: createCustomId(0, ctx.author.id, ctx.originalInteractionId, 'SELECT'),
    minValues: 1,
    disabled: user.id !== ctx.user.id,
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

  const userBadges = getUserBadges(userData, user);

  if (userBadges.length > 12)
    toSendEmbeds.push(
      createEmbed({ color: hexStringToNumber(userData.selectedColor), fields: [] }),
    );

  userBadges.forEach((a, i) => {
    const isSelected = userData.hiddingBadges.includes(a.id);

    if (!selectMenu.options.some((b: { value: string }) => b.value === `${a.id}`))
      selectMenu.options.push({
        label: profileBadges[a.id as 1].name,
        value: `${a.id}`,
        default: isSelected,
        emoji: extractNameAndIdFromEmoji(EMOJIS[`badge_${a.id}` as 'angels']),
      });

    toSendEmbeds[i < 12 ? 0 : 1].fields?.push({
      name: `${EMOJIS[`badge_${a.id}` as 'angels']} | ${profileBadges[a.id as 1].name}`,
      value: ctx.locale('commands:badges.badge-info', {
        unix: Math.floor(Number(a.obtainAt) / 1000),
        description: profileBadges[a.id as 1].description,
        rarity: ctx.locale(`common:rarities.${profileBadges[a.id as 1].rarityLevel}`),
      }),
      inline: true,
    });
  });

  if (userBadges.length === 0)
    toSendEmbeds[0].description = ctx.locale('commands:badges.no-badges', {
      user: getDisplayName(user),
    });

  selectMenu.maxValues = selectMenu.options.length;

  ctx.makeMessage({ embeds: toSendEmbeds, components: [createActionRow([selectMenu])] });

  finishCommand();
};

const personalizeThemeComponents = async (
  ctx: ComponentInteractionContext<SelectMenuInteraction>,
) => {
  const selected = ctx.interaction.data.values[0];
  const themeId = Number(selected);
  const [action, themeType, embedColor] = ctx.sentData;

  if (action === 'CHANGE')
    return executeThemesCommand(ctx, selected as AvailableThemeTypes, embedColor);

  const componentsToSend = [];

  switch (themeType) {
    case 'profile': {
      await userThemesRepository.setProfileTheme(ctx.user.id, themeId);

      const themeData = getThemeById<ProfileTheme>(themeId);

      if (themeData.data.customEdits && themeData.data.customEdits.length > 0) {
        await userThemesRepository.setCustomizedProfile(
          ctx.user.id,
          themeData.data.customEdits.map((a) => [a, 'false']).flat(),
        );

        componentsToSend.push(
          createActionRow([
            createButton({
              label: ctx.locale('commands:temas.edit-profile.customize'),
              style: ButtonStyles.Primary,
              customId: createCustomId(4, ctx.user.id, ctx.originalInteractionId, 'CUSTOM'),
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

  await executeThemesCommand(ctx, themeType as AvailableThemeTypes, embedColor);

  await ctx.followUp({
    flags: setComponentsV2Flag(MessageFlags.Ephemeral),
    components: [createTextDisplay(ctx.prettyResponse('success', 'commands:temas.selected'))],
  });
};

const executeThemesCommand = async (
  ctx: InteractionContext,
  themeType: AvailableThemeTypes,
  embedColor: string,
) => {
  const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);

  const availableTypes = [
    'profile',
    'cards',
    'table',
    'card_background',
    'eb_background',
    'eb_text_box',
    'eb_menhera',
  ] as const;

  const themeTypeSelectMenu = createSelectMenu({
    customId: createCustomId(
      1,
      ctx.user.id,
      ctx.originalInteractionId,
      'CHANGE',
      themeType,
      embedColor,
    ),
    options: availableTypes.map((a) => ({
      label: ctx.locale(`commands:temas.${a}`),
      value: a,
      default: a === themeType,
    })),
    maxValues: 1,
    minValues: 1,
  });

  const container = createContainer({
    accentColor: hexStringToNumber(embedColor),
    components: [],
  });

  const titleComponent = createTextDisplay(
    `## ${ctx.prettyResponse('ribbon', 'commands:temas.title')}`,
  );

  let componentToPush: (typeof container)['components'][number] = titleComponent;

  if (themeType === 'profile') {
    const themeData = getThemeById<ProfileTheme>(userThemes.selectedProfileTheme);

    if (themeData.data.customEdits && themeData.data.customEdits.length > 0)
      componentToPush = createSection({
        components: [titleComponent],
        accessory: createButton({
          label: ctx.locale('commands:temas.edit-profile.customize'),
          style: ButtonStyles.Primary,
          customId: createCustomId(4, ctx.user.id, ctx.originalInteractionId, 'CUSTOM'),
        }),
      });
  }

  container.components.push(
    componentToPush,
    createActionRow([themeTypeSelectMenu]),
    createSeparator(),
  );

  const selectMenu = createSelectMenu({
    customId: createCustomId(
      1,
      ctx.user.id,
      ctx.originalInteractionId,
      'SELECT',
      themeType,
      embedColor,
    ),
    placeholder: ctx.locale('commands:temas.choose'),
    minValues: 1,
    maxValues: 1,
    options: [],
  });

  ensureUserHaveDefaultThemes(userThemes);

  let text = '';

  const availableThemes = getUserActiveThemes(userThemes).reduce<IdentifiedData<ThemeFile>[]>(
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

      text += `\n- **${ctx.locale(`data:themes.${c.id as 1}.name`)}** [${ctx.locale(
        'commands:temas.aquired-at',
        { unix: millisToSeconds(c.aquiredAt) },
      )}]\n_${ctx.locale(`data:themes.${c.id as 1}.description`)}_`;

      return p;
    },
    [],
  );

  if (availableThemes.length === 0) {
    text = `_${ctx.locale('commands:temas.no-themes')}_`;
    container.components.push(createTextDisplay(text));
    return ctx.makeLayoutMessage({ components: [container] });
  }

  container.components.push(createTextDisplay(text), createActionRow([selectMenu]));

  return ctx.makeLayoutMessage({ components: [container] });
};

const createCustomizeMessage = async (
  ctx: ComponentInteractionContext,
  useDbCustomized: boolean,
): Promise<void> => {
  const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);
  const currentTheme = getThemeById<ProfileTheme>(userThemes.selectedProfileTheme);

  if (!currentTheme.data.customEdits || currentTheme.data.customEdits.length === 0)
    return ctx.respondInteraction({
      flags: MessageFlags.Ephemeral,
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

  const container = createContainer({
    accentColor: hexStringToNumber(
      (await userRepository.ensureFindUser(ctx.user.id)).selectedColor,
    ),
    components: [
      createSection({
        accessory: createButton({
          customId: createCustomId(4, ctx.user.id, ctx.originalInteractionId, 'SAVE'),
          label: ctx.locale('commands:temas.edit-profile.save'),
          style: ButtonStyles.Primary,
        }),
        components: [
          createTextDisplay(
            `## ${ctx.prettyResponse('wink', 'commands:temas.edit-profile.title', {
              theme: ctx.locale(`data:themes.${userThemes.selectedProfileTheme as 1}.name`),
            })}\n${currentTheme.data.customEdits
              .map(
                (field) =>
                  `${ctx.locale(
                    `data:themes.${currentTheme.id as 30}.customFields.${field as 'upperTextBoxFilled'}`,
                  )}: ${ctx.locale(`common:${getCustomThemeField(field, fieldToUse)}`)}`,
              )
              .join('\n')}`,
          ),
        ],
      }),
      createSeparator(),
    ],
  });

  const selectMenu = createSelectMenu({
    customId: createCustomId(4, ctx.user.id, ctx.originalInteractionId, 'SELECT'),
    minValues: 0,
    maxValues: currentTheme.data.customEdits.length,
    options: currentTheme.data.customEdits.map((field) => ({
      label: ctx.locale(
        `data:themes.${currentTheme.id as 30}.customFields.${field as 'upperTextBoxFilled'}`,
      ),
      value: `${field}|${getCustomThemeField(field, fieldToUse)}`,
      emoji: {
        name: ctx.locale(`common:${getCustomThemeField(field, fieldToUse)}`),
      },
      default: getCustomThemeField(field, fieldToUse),
    })),
  });

  await ctx.ack();

  const userData = await userRepository.ensureFindUser(ctx.user.id);

  const userTitle =
    userData.currentTitle === 0 ? null : await titlesRepository.getTitleInfo(userData.currentTitle);

  const res = await vanGoghRequest(VanGoghEndpoints.Profile, {
    user: {
      id: userData.id,
      color: userData.selectedColor,
      image: getProfileImageUrl(userThemes.selectedImage, bot),
      avatar: getUserAvatar(ctx.user, { size: 512 }),
      votes: userData.votes,
      info: userData.info,
      badges: getUserBadges(userData, ctx.user).map((a) => a.id),
      username: getDisplayName(ctx.user, true),
      marryDate: userData.marriedDate as string,
      mamadas: userData.mamado,
      mamou: userData.mamou,
      title: userTitle
        ? (userTitle.textLocalizations?.[ctx.interaction.locale as AvailableLanguages] ??
          userTitle.text)
        : '',
      hiddingBadges: userData.hiddingBadges,
      marryUsername: '',
      married: false,
    } satisfies VangoghUserprofileData,
    i18n: {
      aboutme: ctx.locale('commands:perfil.about-me'),
      mamado: ctx.locale('commands:perfil.mamado'),
      mamou: ctx.locale('commands:perfil.mamou'),
      usages: ctx.locale('commands:perfil.commands-usage', {
        user: previewProfileData.user.username,
        usedCount: previewProfileData.usageCommands.cmds.count,
        count: previewProfileData.usageCommands.cmds.count,
        mostUsedCommandName: previewProfileData.usageCommands.array[0].name,
        mostUsedCommandCount: previewProfileData.usageCommands.array[0].count,
      }),
    },
    hashedData: md5(
      `${currentTheme.data.theme}-${fieldToUse.join(',')}-${JSON.stringify(
        previewProfileData.user,
      )}`,
    ),
    type: currentTheme.data.theme,
    customEdits: fieldToUse,
  });

  let toSendFile;

  if (!res.err) {
    container.components.push(createMediaGallery([{ media: { url: 'attachment://profile.png' } }]));

    toSendFile = [
      {
        name: 'profile.png',
        blob: res.data,
      },
    ];
  }

  container.components.push(createActionRow([selectMenu]));

  await ctx.makeLayoutMessage({
    components: [container],
    files: toSendFile,
    attachments: isUndefined(toSendFile) ? [] : undefined,
  });
};

const customizeProfileTheme = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [type] = ctx.sentData;

  if (type === 'CUSTOM') return createCustomizeMessage(ctx, true);

  if (type === 'SELECT') return createCustomizeMessage(ctx, false);

  if (type === 'SAVE') {
    const data = (
      (
        (ctx.interaction.message?.components[0].components as ContainerComponent['components']).at(
          -1,
        ) as ActionRow
      ).components[0] as StringSelectComponent
    ).options
      .map((a) => {
        const splitted = a.value.split('|');

        return [splitted[0], splitted[1]];
      })
      .flat();

    await userThemesRepository.setCustomizedProfile(ctx.user.id, data);

    return ctx.makeLayoutMessage({
      attachments: [],
      components: [
        createTextDisplay(ctx.prettyResponse('success', 'commands:temas.edit-profile.success')),
      ],
    });
  }
};

const executeAllowMamada = async (
  ctx: InteractionContext,
  userData?: DatabaseUserSchema,
): Promise<void> => {
  if (ctx instanceof ComponentInteractionContext) {
    const [toChange] = ctx.sentData;

    await userRepository.updateUser(ctx.user.id, { allowMamar: toChange === 'true' });
  }

  const user = userData ?? (await userRepository.ensureFindUser(ctx.user.id));
  const { allowMamar } = user;

  const embed = createEmbed({
    title: ctx.prettyResponse('question', 'commands:mamar.allow-question'),
    color: hexStringToNumber(user.selectedColor),
    thumbnail: { url: getUserAvatar(ctx.user, { enableGif: true }) },
    description: ctx.locale('commands:mamar.allow-description', {
      permission: ctx.locale(`commands:mamar.allowed-${allowMamar}`),
    }),
  });

  ctx.makeMessage({
    embeds: [embed],
    components: [
      createActionRow([
        createButton({
          label: ctx.locale(`commands:mamar.allow-${!allowMamar}`),
          style: ButtonStyles.Secondary,
          customId: createCustomId(5, ctx.user.id, ctx.originalInteractionId, !allowMamar),
        }),
      ]),
    ],
  });
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
      name: 'mamadas',
      nameLocalizations: { 'en-US': 'licks' },
      description: '「😝」・Informe a Menhera se tu quer ser mamado',
      descriptionLocalizations: { 'en-US': '「😝」・Tell Menhera if you want to be licked' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'imagem',
      nameLocalizations: { 'en-US': 'image' },
      description: '「🌌」・Muda a imagem do seu perfil',
      descriptionLocalizations: { 'en-US': '「🌌」・Change your profile image' },
      type: ApplicationCommandOptionTypes.SubCommand,
    },
    {
      name: 'temas',
      nameLocalizations: { 'en-US': 'themes' },
      description: '「🎊」・Personalize os temas da sua conta!',
      descriptionLocalizations: { 'en-US': '「🎊」・Customize your account themes!' },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [],
    },
    {
      name: 'badges',
      description: '「📌」・Escolha quais badges devem aparecer em seu perfil',
      descriptionLocalizations: {
        'en-US': '「📌」・Choose which badges should appear on your profile',
      },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          type: ApplicationCommandOptionTypes.User,
          name: 'usuário',
          nameLocalizations: { 'en-US': 'user' },
          description: 'Usuário para ver as badges',
          descriptionLocalizations: { 'en-US': 'User to see the badges ' },
          required: false,
        },
      ],
    },
    {
      name: 'título',
      description: '「🧧」・Escolha o título que aparece em seu perfil',
      descriptionLocalizations: {
        'en-US': '「🧧」・Choose the title that appears on your profile',
      },
      type: ApplicationCommandOptionTypes.SubCommand,
      options: [
        {
          type: ApplicationCommandOptionTypes.User,
          name: 'usuário',
          nameLocalizations: { 'en-US': 'user' },
          description: 'Usuário para ver os títulos',
          descriptionLocalizations: { 'en-US': 'User to see the titles ' },
          required: false,
        },
        {
          type: ApplicationCommandOptionTypes.Integer,
          name: 'título',
          nameLocalizations: { 'en-US': 'title' },
          description: 'Escreva o título',
          descriptionLocalizations: { 'en-US': 'Input the title' },
          required: false,
          autocomplete: true,
        },
      ],
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
    personalizeThemeComponents,
    executeColorComponents,
    executeSelectedImageComponent,
    customizeProfileTheme,
    executeAllowMamada,
  ],
  execute: async (ctx, finishCommand) => {
    const command = ctx.getSubCommand();

    if (command === 'sobre_mim') return executeAboutMeCommand(ctx, finishCommand);

    if (command === 'cor') return executeColorCommand(ctx, finishCommand);

    if (command === 'imagem') return executeImageCommand(ctx, finishCommand);

    if (command === 'temas')
      return executeThemesCommand(ctx, 'profile', ctx.authorData.selectedColor);

    if (command === 'badges') return executeBadgesCommand(ctx, finishCommand);

    if (command === 'título') return finishCommand(executeTitleCommand(ctx));

    if (command === 'mamadas') return finishCommand(executeAllowMamada(ctx, ctx.authorData));
  },
});

export default PersonalizeCommand;
