/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

import { CANNOT_BUY_THEMES, COLORS, emojis, shopEconomy } from '@structures/Constants';
import MagicItems from '@data/HuntMagicItems';
import { AvailableThemeTypes, HuntingTypes, IHuntProbablyBoostItem } from '@utils/Types';
import Util, {
  actionRow,
  debugError,
  getAllThemeUserIds,
  getThemeById,
  getThemesByType,
  resolveCustomId,
} from '@utils/Util';
import {
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
  MessageComponentInteraction,
  MessageButton,
  MessageActionRow,
  ColorResolvable,
  MessageAttachment,
} from 'discord.js-light';
import ProfilePreview from '@utils/ThemePreviewTemplates';
import HttpRequests from '@utils/HTTPrequests';

export default class ShopInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'loja',
      description: '「💴」・Abre o brechó da Menhera',
      options: [
        {
          name: 'comprar',
          description: '「🛒」・Abre a loja de compras',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'itens',
              description: '「🔮」・ Compre itens mágicos para melhorar suas habilidades',
              type: 'SUB_COMMAND',
            },
            {
              name: 'cores',
              description: '「🌈」・Compre cores para dar um UP em seu perfil!',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'hex',
                  description: 'Código da cor caso você vá comprar uma cor personalizada',
                  type: 'STRING',
                  required: false,
                },
                {
                  name: 'nome',
                  description: 'Nome da cor personalizada para a identificar. Máximo 20 caracteres',
                  type: 'STRING',
                  required: false,
                },
              ],
            },
            {
              name: 'rolls',
              description: '「🎟️」・Compre rolls para resetar seu tempo de caça',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'quantidade',
                  description: 'Quantidade de rolls que você quer comprar',
                  type: 'INTEGER',
                  required: true,
                  minValue: 1,
                },
              ],
            },
            {
              name: 'temas',
              description: '「🎊」・Compre temas para a sua conta',
              type: 'SUB_COMMAND',
            },
          ],
        },
        {
          name: 'vender',
          description: '「💸」・ Venda suas caças',
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'tipo',
              description: 'Tipo da caça para vender',
              type: 'STRING',
              required: true,
              choices: [
                {
                  name: '😈 | Demônios',
                  value: 'demons',
                },
                {
                  name: '👊 | Gigantes',
                  value: 'giants',
                },
                {
                  name: '👼 | Anjos',
                  value: 'angels',
                },
                {
                  name: '🧚‍♂️ | Arcanjos',
                  value: 'archangels',
                },
                {
                  name: '🙌 | Semideuses',
                  value: 'demigods',
                },
                {
                  name: '✝️ | Deuses',
                  value: 'gods',
                },
              ],
            },
            {
              name: 'quantidade',
              description: 'Quantidade de caças para vender',
              type: 'INTEGER',
              required: true,
              minValue: 1,
            },
          ],
        },
        {
          name: 'info',
          description: '「📊」・Mostra a tabela de preços da Menhera',
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'comprar',
              description: '「📈」・ Mostra os preços de itens de compras',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'tipo',
                  description: 'Tipo da compra para precificar',
                  type: 'STRING',
                  required: true,
                  choices: [
                    {
                      name: '🌈 | Cores',
                      value: 'colors',
                    },
                    {
                      name: '🔑 | Rolls',
                      value: 'rolls',
                    },
                    {
                      name: '🔮 | Itens Mágicos',
                      value: 'items',
                    },
                  ],
                },
              ],
            },
            {
              name: 'vender',
              description: '「📈」・ Mostra os preços de itens de venda',
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'tipo',
                  description: 'Tipo de vendas para precificar',
                  type: 'STRING',
                  required: true,
                  choices: [
                    {
                      name: '🐾 | Caças',
                      value: 'hunts',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      category: 'economy',
      cooldown: 10,
      authorDataFields: [
        'estrelinhas',
        'demons',
        'giants',
        'angels',
        'archangels',
        'gods',
        'demigods',
        'colors',
        'rolls',
        'inUseItems',
        'inventory',
        'selectedColor',
        'badges',
      ],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getSubcommandGroup(false);

    if (!type) return ShopInteractionCommand.sellHunts(ctx);

    if (type === 'comprar') {
      const option = ctx.options.getSubcommand();

      if (option === 'cores') return ShopInteractionCommand.buyColor(ctx);

      if (option === 'rolls') return ShopInteractionCommand.buyRolls(ctx);

      if (option === 'itens') return ShopInteractionCommand.buyItems(ctx);

      if (option === 'temas') return ShopInteractionCommand.buyThemes(ctx);
    }

    if (type === 'info') {
      const option = ctx.options.getSubcommand();

      if (option === 'comprar') return ShopInteractionCommand.buyInfo(ctx);

      if (option === 'vender') return ShopInteractionCommand.sellInfo(ctx);
    }
  }

  static async buyThemes(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:loja.buy_themes.title'))
      .setDescription(ctx.locale('commands:loja.buy_themes.description'))
      .setColor(ctx.data.user.selectedColor);

    const selector = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setMinValues(1)
      .setMaxValues(1);

    const profileButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | PROFILE`)
      .setStyle('PRIMARY')
      .setDisabled(true)
      .setLabel(ctx.locale('common:theme_types.profile'));

    const cardsButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | CARDS`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('common:theme_types.cards'));

    const backgroundButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | BACKGROUND`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('common:theme_types.card_background'));

    const tableButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | TABLE`)
      .setStyle('PRIMARY')
      .setLabel(ctx.locale('common:theme_types.table'));

    const previewButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | PREVIEW`)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('commands:loja.buy_themes.preview-mode'));

    const userThemes = await ctx.client.repositories.themeRepository.findOrCreate(ctx.author.id);
    const haveUserThemes = getAllThemeUserIds(userThemes);

    const components: MessageActionRow[] = [
      actionRow([profileButton, cardsButton, backgroundButton, tableButton, previewButton]),
    ];

    let previewMode = false;
    let currentThemeType: AvailableThemeTypes;

    // themeIndex is the index of components array
    const changeThemeType = async (themeIndex: number): Promise<void> => {
      const themeByIndex: { [key: number]: AvailableThemeTypes } = {
        0: 'profile',
        1: 'cards',
        2: 'card_background',
        3: 'table',
      };

      currentThemeType = themeByIndex[themeIndex];

      components[0].components.map((a, i) => a.setDisabled(i === themeIndex));

      embed.setFields([]);
      selector.setOptions([]);

      const themes = getThemesByType(themeByIndex[themeIndex]);

      const credits = await ctx.client.repositories.creditsRepository.getThemesOwnerId(
        themes.map((a) => a.id),
      );

      for (const theme of themes) {
        if (CANNOT_BUY_THEMES.includes(theme.id)) continue;
        const inInventory = haveUserThemes.some((b) => b.id === theme.id);

        if (theme.data.type !== themeByIndex[themeIndex]) return;

        embed.addField(
          `${ctx.locale(`data:themes.${theme.id as 1}.name`)} ${
            inInventory ? `__${ctx.locale('commands:loja.buy_themes.owned')}__` : ''
          }`,
          ctx.locale('commands:loja.buy_themes.data', {
            description: ctx.locale(`data:themes.${theme.id as 1}.description`),
            price: theme.data.price,
            rarity: theme.data.rarity,
            author: credits.find((b) => b.themeId === theme.id)?.ownerId,
          }),
          true,
        );

        if (!inInventory)
          selector.addOptions({
            label: ctx.locale(`data:themes.${theme.id as 1}.name`),
            description: ctx.locale(`data:themes.${theme.id as 1}.description`).substring(0, 100),
            value: `${theme.id}`,
          });
      }

      if (selector.options.length > 0) components[1] = actionRow([selector]);
      else if (typeof components[1] !== 'undefined') components.pop();
      ctx.makeMessage({ embeds: [embed], components });
    };

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.author.id;

    changeThemeType(0);

    const collector = ctx.channel.createMessageComponentCollector({
      time: 12000,
      maxComponents: 8,
      filter,
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'selected') ctx.deleteReply();
    });

    collector.on('collect', async (int) => {
      int.deferUpdate();
      collector.resetTimer();
      const type = resolveCustomId(int.customId);

      switch (type) {
        case 'SELECT': {
          const selectedItem = getThemeById(Number((int as SelectMenuInteraction).values[0]));

          if (previewMode) {
            if (currentThemeType === 'profile') {
              const res = ctx.client.picassoWs.isAlive
                ? await ctx.client.picassoWs.makeRequest({
                    id: ctx.interaction.id,
                    type: 'profile',
                    data: {
                      user: ProfilePreview.user,
                      marry: ProfilePreview.marry,
                      usageCommands: ProfilePreview.usageCommands,
                      i18n: {
                        aboutme: ctx.locale('commands:perfil.about-me'),
                        mamado: ctx.locale('commands:perfil.mamado'),
                        mamou: ctx.locale('commands:perfil.mamou'),
                        zero: ctx.locale('commands:perfil.zero'),
                        um: ctx.locale('commands:perfil.um'),
                        dois: ctx.locale('commands:perfil.dois'),
                        tres: ctx.locale('commands:perfil.tres'),
                      },
                      type: selectedItem.data.theme,
                    },
                  })
                : await HttpRequests.profileRequest(
                    ProfilePreview.user,
                    // @ts-expect-error Falso mock
                    ProfilePreview.marry,
                    ProfilePreview.usageCommands,
                    {
                      aboutme: ctx.locale('commands:perfil.about-me'),
                      mamado: ctx.locale('commands:perfil.mamado'),
                      mamou: ctx.locale('commands:perfil.mamou'),
                      zero: ctx.locale('commands:perfil.zero'),
                      um: ctx.locale('commands:perfil.um'),
                      dois: ctx.locale('commands:perfil.dois'),
                      tres: ctx.locale('commands:perfil.tres'),
                    },
                    selectedItem.data.theme,
                  );

              if (res.err) {
                await ctx.send({
                  content: ctx.prettyResponse('error', 'common:http-error'),
                });
                return;
              }

              await ctx.send({
                files: [new MessageAttachment(res.data, 'profile-preview.png')],
              });
              return;
            }

            const res = ctx.client.picassoWs.isAlive
              ? await ctx.client.picassoWs.makeRequest({
                  id: ctx.interaction.id,
                  type: 'preview',
                  data: {
                    theme: selectedItem.data.theme,
                    previewType: currentThemeType,
                  },
                })
              : await HttpRequests.previewRequest(selectedItem.data.theme, currentThemeType);

            if (res.err) {
              await ctx.send({
                content: ctx.prettyResponse('error', 'common:http-error'),
              });
              return;
            }

            await ctx.send({
              files: [new MessageAttachment(res.data, 'theme-preview.png')],
            });
            return;
          }

          collector.stop('selected');

          if (ctx.data.user.estrelinhas < selectedItem.data.price) {
            ctx.makeMessage({
              components: [],
              embeds: [],
              content: ctx.prettyResponse('error', 'commands:loja.buy_themes.poor'),
            });
            return;
          }

          const credits = await ctx.client.repositories.creditsRepository.getThemeInfo(
            selectedItem.id,
          );

          await ctx.client.repositories.shopRepository.buyTheme(
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

          const { notifyPurchase } = await ctx.client.repositories.themeRepository.findOrCreate(
            credits.ownerId,
            ['notifyPurchase'],
          );

          if (notifyPurchase)
            await ctx.client.users
              .forge(credits.ownerId)
              .send({
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
              })
              .catch(debugError);

          break;
        }
        case 'PROFILE':
          changeThemeType(0);
          break;
        case 'CARDS':
          changeThemeType(1);
          break;
        case 'BACKGROUND':
          changeThemeType(2);
          break;
        case 'TABLE':
          changeThemeType(3);
          break;
        case 'PREVIEW': {
          previewMode = !previewMode;
          (components[0].components[4] as MessageButton).setStyle(
            previewMode ? 'DANGER' : 'SUCCESS',
          );
          const indexByTheme: { [key: string]: number } = {
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
  }

  static async buyItems(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:loja.buy_item.title'))
      .setColor(COLORS.Pinkie)
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setDescription(ctx.locale('commands:loja.buy_item.description'));

    const selectMenu = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | BUY`)
      .setMinValues(1)
      .setMaxValues(1);

    for (let i = 1; i <= 6; i++) {
      if (
        !ctx.data.user.inventory.some((a) => a.id === i) &&
        !ctx.data.user.inUseItems.some((a) => a.id === i)
      ) {
        selectMenu.addOptions({
          label: ctx.locale(`data:magic-items.${i as 1}.name`),
          value: `${i}`,
          description: `${(MagicItems[i] as IHuntProbablyBoostItem).cost} ${emojis.estrelinhas}`,
        });
      }
    }

    if (selectMenu.options.length === 0) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:loja.buy_item.hasAll') });
      return;
    }

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selectMenu])] });

    const choice = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      10000,
    );

    if (!choice) {
      ctx.makeMessage({
        components: [
          actionRow([selectMenu.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))]),
        ],
      });
      return;
    }

    const selectedItem = Number(choice.values[0]);

    if ((MagicItems[selectedItem] as IHuntProbablyBoostItem).cost > ctx.data.user.estrelinhas) {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'commands:loja.buy_item.poor'),
      });
      return;
    }

    ctx.client.repositories.shopRepository.buyItem(
      ctx.author.id,
      selectedItem,
      (MagicItems[selectedItem] as IHuntProbablyBoostItem).cost,
    );

    ctx.makeMessage({
      embeds: [],
      components: [],
      content: ctx.prettyResponse('success', 'commands:loja.buy_item.success', {
        item: ctx.locale(`data:magic-items.${selectedItem as 1}.name`),
      }),
    });
  }

  static async buyInfo(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);

    if (type === 'colors') {
      const availableColors = [
        {
          cor: '#6308c0',
          price: shopEconomy.colors.purple,
          nome: `**${ctx.locale('commands:loja.colors.purple')}**`,
        },
        {
          cor: '#df0509',
          price: shopEconomy.colors.red,
          nome: `**${ctx.locale('commands:loja.colors.red')}**`,
        },
        {
          cor: '#55e0f7',
          price: shopEconomy.colors.cian,
          nome: `**${ctx.locale('commands:loja.colors.cian')}**`,
        },
        {
          cor: '#03fd1c',
          price: shopEconomy.colors.green,
          nome: `**${ctx.locale('commands:loja.colors.green')}**`,
        },
        {
          cor: '#fd03c9',
          price: shopEconomy.colors.pink,
          nome: `**${ctx.locale('commands:loja.colors.pink')}**`,
        },
        {
          cor: '#e2ff08',
          price: shopEconomy.colors.yellow,
          nome: `**${ctx.locale('commands:loja.colors.yellow')}**`,
        },
        {
          cor: 'SUA ESCOLHA',
          price: shopEconomy.colors.your_choice,
          nome: `**${ctx.locale('commands:loja.colors.your_choice')}**`,
        },
      ];

      const dataCores = {
        title: ctx.locale('commands:loja.dataCores_fields.title'),
        color: '#6cbe50' as const,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        fields: [
          {
            name: ctx.locale('commands:loja.dataCores_fields.field_name'),
            value: availableColors
              .map(
                (c) =>
                  `${c.nome} | ${ctx.locale('commands:loja.dataCores_fields.color_code')} \`${
                    c.cor
                  }\` | ${ctx.locale('commands:loja.dataCores_fields.price')} **${c.price}**⭐`,
              )
              .join('\n'),
            inline: false,
          },
        ],
      };
      ctx.makeMessage({ embeds: [dataCores] });
      return;
    }

    if (type === 'rolls') {
      const dataRolls = {
        title: ctx.locale('commands:loja.dataRolls_fields.title'),
        color: '#b66642' as const,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        fields: [
          {
            name: ctx.locale('commands:loja.dataRolls_fields.fields.name'),
            value: ctx.locale('commands:loja.dataRolls_fields.fields.value', {
              price: shopEconomy.hunts.roll,
            }),
            inline: false,
          },
        ],
      };
      ctx.makeMessage({ embeds: [dataRolls] });
    }

    if (type === 'items') {
      const ItemsEmbed = new MessageEmbed()
        .setTitle(ctx.locale('commands:loja.dataItems.title'))
        .setColor(COLORS.Pinkie)
        .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }));

      for (let i = 1; i <= 6; i++) {
        ItemsEmbed.addField(
          ctx.locale(`data:magic-items.${i as 1}.name`),
          ctx.locale('commands:loja.dataItems.description', {
            description: ctx.locale(`data:magic-items.${i as 1}.description`),
            cost: (MagicItems[i] as IHuntProbablyBoostItem).cost,
          }),
          true,
        );
      }

      ctx.makeMessage({ embeds: [ItemsEmbed] });
    }
  }

  static async sellInfo(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);

    if (type === 'hunts') {
      const dataVender = {
        title: ctx.locale('commands:loja.embed_title'),
        color: '#e77fa1' as const,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        fields: [
          {
            name: ctx.locale('commands:loja.dataVender.main.fields.name'),
            value: ctx.locale('commands:loja.dataVender.main.fields.value', {
              demon: shopEconomy.hunts.demons,
              giant: shopEconomy.hunts.giants,
              angel: shopEconomy.hunts.angels,
              archangel: shopEconomy.hunts.archangels,
              demi: shopEconomy.hunts.demigods,
              god: shopEconomy.hunts.gods,
            }),
            inline: false,
          },
        ],
      };
      ctx.makeMessage({ embeds: [dataVender] });
    }
  }

  static async sellHunts(ctx: InteractionCommandContext): Promise<void> {
    const huntType = ctx.options.getString('tipo', true) as HuntingTypes;
    const amount = ctx.options.getInteger('quantidade', true);

    if (amount < 1) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.dataVender.invalid-args'),
        ephemeral: true,
      });
      return;
    }

    if (amount > ctx.data.user[huntType]) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.dataVender.poor', {
          var: ctx.locale(`common:${huntType}`),
        }),
        ephemeral: true,
      });
      return;
    }

    ctx.client.repositories.shopRepository.sellHunt(
      ctx.author.id,
      huntType,
      amount,
      amount * shopEconomy.hunts[huntType],
    );

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:loja.dataVender.success', {
        value: amount,
        cost: amount * shopEconomy.hunts[huntType],
        quantity: ctx.data.user[huntType] - amount,
        hunt: ctx.locale(`common:${huntType}`),
        emoji: emojis[huntType],
        star: ctx.data.user.estrelinhas + amount * shopEconomy.hunts[huntType],
      }),
    });
  }

  static async buyRolls(ctx: InteractionCommandContext): Promise<void> {
    const amount = ctx.options.getInteger('quantidade', true);

    if (amount < 1) {
      ctx.makeMessage({
        content: ctx.prettyResponse(
          'error',
          'commands:loja.dataRolls_fields.buy_rolls.invalid-number',
        ),
        ephemeral: true,
      });
      return;
    }

    const totalCost = amount * shopEconomy.hunts.roll;

    if (totalCost > ctx.data.user.estrelinhas) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.dataRolls_fields.buy_rolls.poor'),
        ephemeral: true,
      });
      return;
    }

    ctx.client.repositories.shopRepository.buyRoll(ctx.author.id, amount, totalCost);

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:loja.dataRolls_fields.buy_rolls.success', {
        quantity: amount,
        value: totalCost,
        rolls: ctx.data.user.rolls + amount,
        stars: ctx.data.user.estrelinhas - totalCost,
      }),
    });
  }

  static async buyColor(ctx: InteractionCommandContext): Promise<void> {
    const availableColors = [
      {
        cor: '#6308c0',
        price: shopEconomy.colors.purple,
        nome: `**${ctx.locale('commands:loja.colors.purple')}**`,
      },
      {
        cor: '#df0509',
        price: shopEconomy.colors.red,
        nome: `**${ctx.locale('commands:loja.colors.red')}**`,
      },
      {
        cor: '#55e0f7',
        price: shopEconomy.colors.cian,
        nome: `**${ctx.locale('commands:loja.colors.cian')}**`,
      },
      {
        cor: '#03fd1c',
        price: shopEconomy.colors.green,
        nome: `**${ctx.locale('commands:loja.colors.green')}**`,
      },
      {
        cor: '#fd03c9',
        price: shopEconomy.colors.pink,
        nome: `**${ctx.locale('commands:loja.colors.pink')}**`,
      },
      {
        cor: '#e2ff08',
        price: shopEconomy.colors.yellow,
        nome: `**${ctx.locale('commands:loja.colors.yellow')}**`,
      },
      {
        cor: ctx.locale('commands:loja.colors.your_choice').replace('7 - ', ''),
        price: shopEconomy.colors.your_choice,
        nome: `**${ctx.locale('commands:loja.colors.your_choice')}**`,
      },
    ];

    const selector = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | SELECT`)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        availableColors.reduce<MessageSelectOptionData[]>((p, c) => {
          if (ctx.data.user.colors.some((a) => a.cor === c.cor)) return p;

          p.push({
            label: c.nome,
            description: `${c.cor} | ${c.price} ${emojis.estrelinhas}`,
            value: c.cor,
          });
          return p;
        }, []),
      );

    ctx.makeMessage({
      content: ctx.prettyResponse('question', 'commands:loja.buy_colors.buy-text'),
      components: [actionRow([selector])],
    });

    const selected = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      10_000,
    );

    if (!selected) {
      ctx.deleteReply();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const chosenColor = availableColors.find(
      (a) => a.cor === selected.values[0].replace('7 - ', ''),
    )!;

    if (ctx.data.user.estrelinhas < chosenColor.price) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.buy_colors.poor'),
        components: [],
      });
      return;
    }

    if (chosenColor.cor.startsWith('#')) {
      await ctx.client.repositories.shopRepository.buyColor(ctx.author.id, chosenColor.price, {
        nome: chosenColor.nome,
        cor: chosenColor.cor as ColorResolvable,
      });

      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:loja.buy_colors.buy-success', {
          name: chosenColor.nome,
          price: chosenColor.price,
          stars: ctx.data.user.estrelinhas - chosenColor.price,
        }),
      });
      return;
    }

    const hexColor = ctx.options.getString('hex');

    const name: string =
      ctx.options.getString('nome')?.slice(0, 20) ??
      ctx.locale('commands:loja.buy_colors.no-name', {
        number: ctx.data.user.colors.length,
      });

    if (!hexColor) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.buy_colors.invalid-color'),
        components: [],
      });
      return;
    }

    if (
      ctx.data.user.colors.some(
        (a) => `${a.cor}`.replace('#', '') === hexColor.replace('#', '') || a.nome === name,
      )
    ) {
      ctx.makeMessage({
        content: ctx.prettyResponse('yellow_circle', 'commands:loja.buy_colors.has-color'),
        components: [],
      });
      return;
    }

    const isHexColor = (hex: string) => hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));

    if (isHexColor(hexColor.replace('#', ''))) {
      const toPush = {
        nome: name,
        cor: `#${hexColor.replace('#', '')}` as const,
      };
      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'commands:loja.buy_colors.yc-confirm', {
          color: hexColor,
          price: chosenColor.price,
          stars: ctx.data.user.estrelinhas - chosenColor.price,
        }),
        components: [],
      });

      ctx.client.repositories.shopRepository.buyColor(ctx.author.id, chosenColor.price, toPush);
    } else {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.buy_colors.invalid-color'),
        components: [],
      });
    }
  }
}
