import { ButtonComponent, ButtonStyles, InteractionResponseTypes } from 'discordeno/types';
import shopRepository from '../../database/repositories/shopRepository';
import themeCreditsRepository from '../../database/repositories/themeCreditsRepository';
import userThemesRepository from '../../database/repositories/userThemesRepository';
import { bot } from '../../index';
import { getThemeById, getThemesByType, getUserActiveThemes } from '../themes/getThemes';
import { AvailableThemeTypes } from '../themes/types';
import InteractionContext from '../../structures/command/InteractionContext';
import InteractionCollector from '../../structures/InteractionCollector';
import { ComponentInteraction, SelectMenuInteraction } from '../../types/interaction';
import {
  createActionRow,
  createButton,
  createSelectMenu,
  disableComponents,
  generateCustomId,
  resolveCustomId,
} from '../../utils/discord/componentUtils';
import { createEmbed, hexStringToNumber } from '../../utils/discord/embedUtils';
import { MessageFlags } from '../../utils/discord/messageUtils';
import { VanGoghEndpoints, vanGoghRequest } from '../../utils/vanGoghRequest';
import { previewProfileData, unbuyableThemes } from './constants';

const buyThemes = async (ctx: InteractionContext, finishCommand: () => void): Promise<void> => {
  const embed = createEmbed({
    title: ctx.locale('commands:loja.buy_themes.title'),
    description: ctx.locale('commands:loja.buy_themes.description'),
    color: hexStringToNumber(ctx.authorData.selectedColor),
    fields: [],
  });

  const selector = createSelectMenu({
    customId: generateCustomId('SELECT', ctx.interaction.id),
    minValues: 1,
    maxValues: 1,
    options: [],
  });

  const profileButton = createButton({
    customId: generateCustomId('PROFILE', ctx.interaction.id),
    style: ButtonStyles.Primary,
    disabled: true,
    label: ctx.locale('common:theme_types.profile'),
  });

  const cardsButton = createButton({
    customId: generateCustomId('CARDS', ctx.interaction.id),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.cards'),
  });

  const backgroundButton = createButton({
    customId: generateCustomId('BACKGROUND', ctx.interaction.id),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.card_background'),
  });

  const tableButton = createButton({
    customId: generateCustomId('TABLE', ctx.interaction.id),
    style: ButtonStyles.Primary,
    label: ctx.locale('common:theme_types.table'),
  });

  const previewButton = createButton({
    customId: generateCustomId('PREVIEW', ctx.interaction.id),
    style: ButtonStyles.Success,
    label: ctx.locale('commands:loja.buy_themes.preview-mode'),
  });

  const userThemes = await userThemesRepository.findEnsuredUserThemes(ctx.author.id);
  const userThemesIds = getUserActiveThemes(userThemes);

  const components = [
    createActionRow([profileButton, cardsButton, backgroundButton, tableButton, previewButton]),
  ];

  let previewMode = false;
  let currentThemeType: AvailableThemeTypes;

  const changeThemeType = async (themeIndex: 0 | 1 | 2 | 3) => {
    const themeByIndex = {
      0: 'profile',
      1: 'cards',
      2: 'card_background',
      3: 'table',
    } as const;

    currentThemeType = themeByIndex[themeIndex];

    (components[0].components as ButtonComponent[]).map((a, i) => {
      a.disabled = i === themeIndex;
      return a;
    });

    embed.fields = [];
    selector.options = [];

    const themes = getThemesByType(themeByIndex[themeIndex]);

    const credits = await themeCreditsRepository.getThemesOwnerId(themes.map((a) => a.id));

    // eslint-disable-next-line no-restricted-syntax
    for (const theme of themes) {
      // eslint-disable-next-line no-continue
      if (unbuyableThemes.includes(theme.id)) continue;
      const inInventory = userThemesIds.some((a) => a.id === theme.id);

      if (theme.data.type !== themeByIndex[themeIndex]) return finishCommand();

      embed.fields.push({
        name: `${ctx.locale(`data:themes.${theme.id as 1}.name`)} ${
          inInventory ? `__${ctx.locale('commands:loja.buy_themes.owned')}__` : ''
        }`,
        value: ctx.locale('commands:loja.buy_themes.data', {
          description: ctx.locale(`data:themes.${theme.id as 1}.description`),
          price: theme.data.price,
          rarity: theme.data.rarity,
          author: credits.find((b) => b.themeId === theme.id)?.ownerId,
        }),
        inline: true,
      });

      if (!inInventory)
        selector.options.push({
          label: ctx.locale(`data:themes.${theme.id as 1}.name`),
          description: ctx.locale(`data:themes.${theme.id as 1}.description`).substring(0, 100),
          value: `${theme.id}`,
        });
    }

    if (selector.options.length > 0) components[1] = createActionRow([selector]);
    else if (typeof components[1] !== 'undefined') components.pop();

    ctx.makeMessage({ embeds: [embed], components });
  };

  const filter = (int: ComponentInteraction) =>
    int.data.customId.startsWith(`${ctx.interaction.id}`) && int.user.id === ctx.author.id;

  changeThemeType(0);

  const collector = new InteractionCollector({
    idle: 12_000,
    filter,
  });

  collector.on('end', (_, reason) => {
    if (reason === 'idle') {
      ctx.makeMessage({
        components: [
          createActionRow(
            disableComponents(ctx.locale('common:timesup'), components[0].components),
          ),
        ],
      });

      finishCommand();
    }
  });

  collector.on('collect', async (int: ComponentInteraction) => {
    const type = resolveCustomId(int.data.customId);

    switch (type) {
      case 'SELECT': {
        const selectedItem = getThemeById(Number((int as SelectMenuInteraction).data.values[0]));

        if (previewMode) {
          if (currentThemeType === 'profile') {
            await bot.helpers.sendInteractionResponse(int.id, int.token, {
              type: InteractionResponseTypes.DeferredChannelMessageWithSource,
              data: {
                flags: MessageFlags.EPHEMERAL,
              },
            });

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
              type: selectedItem.data.theme,
            });

            if (res.err) {
              await bot.helpers.editOriginalInteractionResponse(int.token, {
                content: ctx.prettyResponse('error', 'common:http-error'),
              });

              return;
            }

            await bot.helpers.editOriginalInteractionResponse(int.token, {
              file: {
                name: 'profile-preview.png',
                blob: res.data,
              },
            });

            return;
          }

          await bot.helpers.sendInteractionResponse(int.id, int.token, {
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

          await bot.helpers.editOriginalInteractionResponse(int.token, {
            file: {
              name: 'theme-preview.png',
              blob: res.data,
            },
          });

          return;
        }

        collector.stop('selected');

        if (ctx.authorData.estrelinhas < selectedItem.data.price) {
          ctx.makeMessage({
            components: [],
            embeds: [],
            content: ctx.prettyResponse('error', 'commands:loja.buy_themes.poor'),
          });

          return finishCommand();
        }

        const credits = await themeCreditsRepository.getThemeInfo(selectedItem.id);

        if (!credits) {
          ctx.makeMessage({
            components: [],
            embeds: [],
            content: ctx.prettyResponse('error', 'commands:loja.buy_themes.not-registered'),
          });

          return finishCommand();
        }

        await shopRepository.executeBuyTheme(
          ctx.author.id,
          selectedItem.id,
          selectedItem.data.price,
          selectedItem.data.type,
          credits.royalty,
        );

        ctx.makeMessage({
          components: [],
          embeds: [],
          content: ctx.prettyResponse('success', 'commands:loja.buy_themes.success'),
        });

        finishCommand();

        const { notifyPurchase } = await userThemesRepository.findEnsuredUserThemes(
          credits.ownerId,
        );

        if (notifyPurchase) {
          const userDM = await bot.helpers
            .getDmChannel(credits.ownerId)
            .catch(ctx.captureException);

          if (userDM)
            bot.helpers.sendMessage(userDM.id, {
              content: `:sparkles: **UM TEMA SEU FOI COMPRADO!** :sparkles:\n\n**Comprador:** ${
                ctx.author.username
              } (${ctx.author.id})\n**Tema Comprado:** ${ctx.locale(
                `data:themes.${selectedItem.id as 1}.name`,
              )}\n**Seu Lucro:** ${Math.floor(
                (credits.royalty / 100) * selectedItem.data.price,
              )} :star:\n**Este tema foi comprado:** ${
                credits.timesSold + 1
              } vezes\n**Você já ganhou:** ${Math.floor(
                credits.totalEarned + (credits.royalty / 100) * selectedItem.data.price,
              )} :star: somente com ele\n\n\`Você pode desativar esta notificação de compra de temas no comando '/status designer'\``,
            });
        }

        break;
      }
      case 'PROFILE':
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });
        changeThemeType(0);
        break;
      case 'CARDS':
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });
        changeThemeType(1);
        break;
      case 'BACKGROUND':
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });
        changeThemeType(2);
        break;
      case 'TABLE':
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });
        changeThemeType(3);
        break;
      case 'PREVIEW': {
        bot.helpers.sendInteractionResponse(int.id, int.token, {
          type: InteractionResponseTypes.DeferredUpdateMessage,
        });
        previewMode = !previewMode;
        (components[0].components[4] as ButtonComponent).style = previewMode
          ? ButtonStyles.Danger
          : ButtonStyles.Success;

        const indexByTheme: { [key: string]: 0 | 1 | 2 | 3 } = {
          profile: 0,
          cards: 1,
          card_background: 2,
          table: 3,
        };
        changeThemeType(indexByTheme[currentThemeType]);
        break;
      }
    }
  });
};

export { buyThemes };
