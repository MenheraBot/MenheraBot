import { ActionRow, ButtonStyles, InteractionResponseTypes } from '@discordeno/bot';

import md5 from 'md5';
import commandRepository from '../../database/repositories/commandRepository.js';
import shopRepository from '../../database/repositories/shopRepository.js';
import themeCreditsRepository from '../../database/repositories/themeCreditsRepository.js';
import userRepository from '../../database/repositories/userRepository.js';
import userThemesRepository, {
  UserSelectedThemeTypes,
} from '../../database/repositories/userThemesRepository.js';
import { bot } from '../../index.js';
import ChatInputInteractionContext from '../../structures/command/ChatInputInteractionContext.js';
import ComponentInteractionContext from '../../structures/command/ComponentInteractionContext.js';
import { SelectMenuInteraction } from '../../types/interaction.js';
import { debugError } from '../../utils/debugError.js';
import {
  createActionRow,
  createButton,
  createCustomId,
  createSelectMenu,
} from '../../utils/discord/componentUtils.js';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils.js';
import { MessageFlags } from '../../utils/discord/messageUtils.js';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest.js';
import { getThemeById, getThemesByType, getUserActiveThemes } from '../themes/getThemes.js';
import { ProfileTheme, ThemeFile } from '../themes/types.js';
import { helloKittyThemes, previewProfileData, unbuyableThemes } from './constants.js';
import {
  editOriginalInteractionResponse,
  sendInteractionResponse,
} from '../../utils/discord/interactionRequests.js';
import giveRepository from '../../database/repositories/giveRepository.js';

const themeByIndex = {
  0: 'profile',
  1: 'cards',
  2: 'card_background',
  3: 'table',
  4: 'eb_background',
  5: 'eb_text_box',
  6: 'eb_menhera',
} as const;

const themeTypeToDatabaseField: Record<ThemeFile['type'], UserSelectedThemeTypes> = {
  card_background: 'selectedCardBackgroundTheme',
  cards: 'selectedCardTheme',
  eb_background: 'selectedEbBackgroundTheme',
  eb_menhera: 'selectedEbMenheraTheme',
  eb_text_box: 'selectedEbTextBoxTheme',
  profile: 'selectedProfileTheme',
  table: 'selectedTableTheme',
};

const executeActivateTheme = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [themeType, themeId] = ctx.sentData;
  await userThemesRepository.setThemeToUserAccount(
    ctx.user.id,
    themeType as 'selectedImage',
    Number(themeId),
  );

  ctx.makeMessage({
    components: [],
    content: ctx.prettyResponse('success', 'commands:loja.buy_themes.activated'),
  });
};

const createThemeComponents = (
  ctx: ChatInputInteractionContext | ComponentInteractionContext,
  preview: boolean,
  currentThemeType: (typeof themeByIndex)[keyof typeof themeByIndex],
): ActionRow[] => {
  const profileButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'PROFILE',
      preview,
      currentThemeType,
    ),
    style: ButtonStyles.Primary,
    disabled: currentThemeType === 'profile',
    label: ctx.locale('common:theme_types.profile'),
  });

  const cardsButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'CARDS',
      preview,
      currentThemeType,
    ),
    disabled: currentThemeType === 'cards',
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.cards'),
  });

  const backgroundButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'BACKGROUND',
      preview,
      currentThemeType,
    ),
    disabled: currentThemeType === 'card_background',
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.card_background'),
  });

  const tableButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'TABLE',
      preview,
      currentThemeType,
    ),
    disabled: currentThemeType === 'table',
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.table'),
  });

  const ebBackgroundButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'EB_BACKGROUND',
      preview,
      currentThemeType,
    ),
    disabled: currentThemeType === 'eb_background',
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.eb_background'),
  });
  const ebTextBoxButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'EB_TEXT_BOX',
      preview,
      currentThemeType,
    ),
    disabled: currentThemeType === 'eb_text_box',
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.eb_text_box'),
  });

  const ebMenheraButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'EB_MENHERA',
      preview,
      currentThemeType,
    ),
    disabled: currentThemeType === 'eb_menhera',
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.eb_menhera'),
  });

  const previewButton = createButton({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'PREVIEW',
      preview,
      currentThemeType,
    ),
    style: preview ? ButtonStyles.Danger : ButtonStyles.Success,
    label: ctx.locale('commands:loja.buy_themes.preview-mode'),
  });

  const components = [
    createActionRow([profileButton, cardsButton, backgroundButton, tableButton, previewButton]),
    createActionRow([ebBackgroundButton, ebTextBoxButton, ebMenheraButton]),
  ];

  return components;
};

const changeThemeType = async (
  themeIndex: keyof typeof themeByIndex,
  preview: boolean,
  ctx: ComponentInteractionContext | ChatInputInteractionContext,
  selectedColor: string,
) => {
  const components = createThemeComponents(ctx, preview, themeByIndex[themeIndex]);

  const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.interaction.user.id);
  const userThemesIds = getUserActiveThemes(userThemes);

  const embed = createEmbed({
    title: ctx.locale('commands:loja.buy_themes.title'),
    description: ctx.locale('commands:loja.buy_themes.description'),
    color: hexStringToNumber(selectedColor),
    fields: [],
  });

  const selector = createSelectMenu({
    customId: createCustomId(
      2,
      ctx.interaction.user.id,
      ctx.originalInteractionId,
      'SELECT',
      preview,
      themeByIndex[themeIndex],
    ),
    minValues: 1,
    maxValues: 1,
    options: [],
  });

  const themes = getThemesByType(themeByIndex[themeIndex]);

  const credits = await themeCreditsRepository.getThemesOwnerId(themes.map((a) => a.id));

  for (const theme of themes) {
    if (unbuyableThemes.includes(theme.id)) continue;
    const inInventory = userThemesIds.some((a) => a.id === theme.id);

    if (theme.data.type !== themeByIndex[themeIndex]) return;

    let embedFieldValue = ctx.locale('commands:loja.buy_themes.data', {
      description: ctx.locale(`data:themes.${theme.id as 1}.description`),
      price: theme.data.price,
      author: credits.find((b) => b.themeId === theme.id)?.ownerId,
    });

    if (theme.data.type === 'profile') {
      embedFieldValue += ctx.locale('commands:loja.buy_themes.profileCompatibles', {
        colorCompatible: ctx.locale(`common:${theme.data.colorCompatible}`),
        imageCompatible: ctx.locale(`common:${theme.data.imageCompatible}`),
      });

      if (theme.data.customEdits)
        embedFieldValue += ctx.locale('commands:loja.buy_themes.customEdits', {
          customEdits: theme.data.customEdits
            .map((a) =>
              // @ts-expect-error customFields are pretty much different
              ctx.locale(`data:themes.${theme.id as 1}.customFields.${a}`),
            )
            .join(', '),
        });
    }

    embed.fields?.push({
      name: `${ctx.locale(`data:themes.${theme.id as 1}.name`)} ${
        inInventory ? `__${ctx.locale('commands:loja.buy_themes.owned')}__` : ''
      }`,
      value: embedFieldValue,
      inline: true,
    });

    if (!inInventory)
      selector.options.push({
        label: ctx.locale(`data:themes.${theme.id as 1}.name`),
        description: ctx.locale(`data:themes.${theme.id as 1}.description`).substring(0, 100),
        value: `${theme.id}`,
      });
  }

  if (selector.options.length > 0) components[2] = createActionRow([selector]);
  else if (typeof components[2] !== 'undefined') components.pop();

  ctx.makeMessage({ embeds: [embed], components });
};

const executeClickButton = async (ctx: ComponentInteractionContext): Promise<void> => {
  const [selectedType, previewMode, currentThemeType] = ctx.sentData;

  const preview = previewMode === 'true';

  const authorData = await userRepository.ensureFindUser(ctx.user.id);

  switch (selectedType) {
    case 'SELECT': {
      const selectedItem = getThemeById<ProfileTheme>(
        Number((ctx.interaction as SelectMenuInteraction).data.values[0]),
      );

      if (preview) {
        if (currentThemeType === 'profile') {
          await sendInteractionResponse(ctx.interaction.id, ctx.interaction.token, {
            type: InteractionResponseTypes.DeferredChannelMessageWithSource,
            data: {
              flags: MessageFlags.EPHEMERAL,
            },
          });

          let customEdits: string[] = [];

          if (selectedItem.data.customEdits && selectedItem.data.customEdits.length > 0)
            customEdits = selectedItem.data.customEdits.map((a) => [a, 'false']).flat();

          const res = await vanGoghRequest(VanGoghEndpoints.Profile, {
            user: previewProfileData.user,
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
            hashedData: md5(
              `${selectedItem.data.theme}-${customEdits.join(',')}-${JSON.stringify(
                previewProfileData.user,
              )}`,
            ),
            type: selectedItem.data.theme,
            customEdits,
          });

          if (res.err) {
            await editOriginalInteractionResponse(ctx.interaction.token, {
              content: ctx.prettyResponse('error', 'common:http-error'),
            });

            return;
          }

          await editOriginalInteractionResponse(ctx.interaction.token, {
            files: [{
              name: 'profile-preview.png',
              blob: res.data,
            }],
          });

          return;
        }

        await sendInteractionResponse(ctx.interaction.id, ctx.interaction.token, {
          type: InteractionResponseTypes.DeferredChannelMessageWithSource,
          data: {
            flags: MessageFlags.EPHEMERAL,
          },
        });

        const res = await vanGoghRequest(VanGoghEndpoints.Preview, {
          theme: selectedItem.data.theme,
          type: currentThemeType,
        });

        if (res.err) {
          await ctx.followUp({
            content: ctx.prettyResponse('error', 'common:http-error'),
            flags: MessageFlags.EPHEMERAL,
          });
          return;
        }

        await editOriginalInteractionResponse(ctx.interaction.token, {
          files: [{
            name: 'theme-preview.png',
            blob: res.data,
          }],
        });

        return;
      }

      if (authorData.estrelinhas < selectedItem.data.price) {
        ctx.makeMessage({
          components: [],
          embeds: [],
          content: ctx.prettyResponse('error', 'commands:loja.buy_themes.poor'),
        });

        return;
      }

      const credits = await themeCreditsRepository.getThemeInfo(selectedItem.id);

      if (!credits) {
        ctx.makeMessage({
          components: [],
          embeds: [],
          content: ctx.prettyResponse('error', 'commands:loja.buy_themes.not-registered'),
        });

        return;
      }

      await shopRepository.executeBuyTheme(
        ctx.user,
        selectedItem.id,
        selectedItem.data.price,
        selectedItem.data.type,
        credits.royalty,
        credits.ownerId,
        ctx.locale(`data:themes.${selectedItem.id as 1}.name`),
      );

      const commandInfo = await commandRepository.getCommandInfo('personalizar');

      const activateButton = createButton({
        customId: createCustomId(
          5,
          ctx.user.id,
          ctx.originalInteractionId,
          themeTypeToDatabaseField[selectedItem.data.type],
          selectedItem.id,
        ),
        label: ctx.locale('commands:loja.buy_themes.activate'),
        style: ButtonStyles.Success,
      });

      await ctx.makeMessage({
        components: [createActionRow([activateButton])],
        embeds: [],
        content: ctx.prettyResponse('success', 'commands:loja.buy_themes.success', {
          command: `</personalizar temas:${commandInfo?.discordId}>`,
        }),
      });

      if (!authorData.badges.some((a) => a.id === 24)) {
        const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.user.id);

        const allThemes = [
          ...userThemes.profileThemes,
          ...userThemes.cardsThemes,
          ...userThemes.tableThemes,
          ...userThemes.cardsBackgroundThemes,
          ...userThemes.ebTextBoxThemes,
          ...userThemes.ebMenheraThemes,
          ...userThemes.ebBackgroundThemes,
        ];

        if (helloKittyThemes.every((a) => allThemes.some((b) => b.id === a)))
          await giveRepository.giveBadgeToUser(ctx.user.id, 24);
      }

      const { notifyPurchase } = await userThemesRepository.findEnsuredUserThemes(credits.ownerId);

      if (notifyPurchase) {
        const userDM = await bot.helpers
          .getDmChannel(credits.ownerId)
          .catch(ctx.captureException.bind(ctx));

        if (userDM)
          bot.helpers
            .sendMessage(userDM.id, {
              content: `:sparkles: **UM TEMA SEU FOI COMPRADO!** :sparkles:\n\n**Comprador:** ${
                ctx.user.username
              } (${ctx.user.id})\n**Tema Comprado:** ${ctx.locale(
                `data:themes.${selectedItem.id as 1}.name`,
              )} \`${ctx.locale(
                `common:theme_types.${selectedItem.data.type}`,
              )}\`\n**Seu Lucro:** ${Math.floor(
                (credits.royalty / 100) * selectedItem.data.price,
              )} :star:\n**Este tema foi comprado:** ${
                credits.timesSold + 1
              } vezes\n**Você já ganhou:** ${Math.floor(
                credits.totalEarned + (credits.royalty / 100) * selectedItem.data.price,
              )} :star: somente com ele\n\n\`Você pode desativar esta notificação de compra de temas no comando '/status designer'\``,
            })
            .catch(debugError);
      }

      break;
    }
    case 'PROFILE':
      changeThemeType(0, preview, ctx, authorData.selectedColor);
      break;
    case 'CARDS':
      changeThemeType(1, preview, ctx, authorData.selectedColor);
      break;
    case 'BACKGROUND':
      changeThemeType(2, preview, ctx, authorData.selectedColor);
      break;
    case 'TABLE':
      changeThemeType(3, preview, ctx, authorData.selectedColor);
      break;
    case 'EB_BACKGROUND':
      changeThemeType(4, preview, ctx, authorData.selectedColor);
      break;
    case 'EB_TEXT_BOX':
      changeThemeType(5, preview, ctx, authorData.selectedColor);
      break;
    case 'EB_MENHERA':
      changeThemeType(6, preview, ctx, authorData.selectedColor);
      break;
    case 'PREVIEW': {
      const indexByTheme: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
        profile: 0,
        cards: 1,
        card_background: 2,
        table: 3,
        eb_background: 4,
        eb_text_box: 5,
        eb_menhera: 6,
      };
      changeThemeType(indexByTheme[currentThemeType], !preview, ctx, authorData.selectedColor);
      break;
    }
  }
};

const buyThemes = async (
  ctx: ChatInputInteractionContext,
  finishCommand: () => void,
): Promise<void> => {
  changeThemeType(0, false, ctx, ctx.authorData.selectedColor);
  finishCommand();
};

export { buyThemes, executeClickButton, executeActivateTheme };
