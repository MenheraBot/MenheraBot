/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

import { CANNOT_BUY_THEMES, COLORS, emojis, shopEconomy } from '@structures/Constants';
import MagicItems from '@data/HuntMagicItems';
import { AvailableThemeTypes, HuntingTypes, IHuntProbablyBoostItem } from '@custom_types/Menhera';
import Util, {
  actionRow,
  debugError,
  disableComponents,
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
  Modal,
  MessageAttachment,
  TextInputComponent,
} from 'discord.js-light';
import ProfilePreview from '@utils/ThemePreviewTemplates';
import { PicassoRoutes, requestPicassoImage } from '@utils/PicassoRequests';

export default class ShopCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'loja',
      nameLocalizations: { 'en-US': 'shop' },
      description: '「💴」・Abre o brechó da Menhera',
      descriptionLocalizations: { 'en-US': "Open Menhera's thrift store" },
      options: [
        {
          name: 'comprar',
          nameLocalizations: { 'en-US': 'buy' },
          description: '「🛒」・Abre a loja de compras',
          descriptionLocalizations: { 'en-US': '「🛒」・Opens the shopping store' },
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'itens',
              nameLocalizations: { 'en-US': 'items' },
              description: '「🔮」・ Compre itens mágicos para melhorar suas habilidades',
              descriptionLocalizations: {
                'en-US': '「🔮」・Buy magic items to improve your skills',
              },
              type: 'SUB_COMMAND',
            },
            {
              name: 'cores',
              nameLocalizations: { 'en-US': 'colors' },
              description: '「🌈」・Compre cores para dar um UP em seu perfil!',
              descriptionLocalizations: { 'en-US': '「🌈」・Buy colors to upgrade your profile!' },
              type: 'SUB_COMMAND',
            },
            {
              name: 'rolls',
              description: '「🎟️」・Compre rolls para resetar seu tempo de caça',
              descriptionLocalizations: { 'en-US': '「🎟️」・Buy rolls to reset your hunting time' },
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'quantidade',
                  nameLocalizations: { 'en-US': 'amount' },
                  description: 'Quantidade de rolls que você quer comprar',
                  descriptionLocalizations: { 'en-US': 'Number of rolls you want to buy' },
                  type: 'INTEGER',
                  required: true,
                  minValue: 1,
                },
              ],
            },
            {
              name: 'temas',
              nameLocalizations: { 'en-US': 'themes' },
              description: '「🎊」・Compre temas para a sua conta',
              descriptionLocalizations: { 'en-US': '「🎊」・Buy themes for your account' },
              type: 'SUB_COMMAND',
            },
          ],
        },
        {
          name: 'vender',
          nameLocalizations: { 'en-US': 'sell' },
          description: '「💸」・ Venda suas caças',
          descriptionLocalizations: { 'en-US': '「💸」・ Sell your fighters' },
          type: 'SUB_COMMAND',
          options: [
            {
              name: 'tipo',
              nameLocalizations: { 'en-US': 'type' },
              description: 'Tipo de caça para vender',
              descriptionLocalizations: { 'en-US': 'Type of hunting to sell' },
              type: 'STRING',
              required: true,
              choices: [
                {
                  name: '⭐ | Estrelinhas',
                  nameLocalizations: { 'en-US': '⭐ | Stars' },
                  value: 'estrelinhas',
                },
                {
                  name: '😈 | Demônios',
                  nameLocalizations: { 'en-US': '😈 | Demons' },
                  value: 'demons',
                },
                {
                  name: '👊 | Gigantes',
                  nameLocalizations: { 'en-US': '👊 | Giants' },
                  value: 'giants',
                },
                {
                  name: '👼 | Anjos',
                  nameLocalizations: { 'en-US': '👼 | Angels' },
                  value: 'angels',
                },
                {
                  name: '🧚‍♂️ | Arcanjos',
                  nameLocalizations: { 'en-US': '🧚‍♂️ | Archangels' },
                  value: 'archangels',
                },
                {
                  name: '🙌 | Semideuses',
                  nameLocalizations: { 'en-US': '🙌 | Demigods' },
                  value: 'demigods',
                },
                {
                  name: '✝️ | Deuses',
                  nameLocalizations: { 'en-US': '✝️ | Gods' },
                  value: 'gods',
                },
              ],
            },
            {
              name: 'quantidade',
              nameLocalizations: { 'en-US': 'amount' },
              description: 'Quantidade de caças para vender',
              descriptionLocalizations: { 'en-US': 'Number of huntings to sell' },
              type: 'INTEGER',
              required: true,
              minValue: 1,
            },
          ],
        },
        {
          name: 'preços',
          nameLocalizations: { 'en-US': 'prices' },
          description: '「📊」・Mostra a tabela de preços da Menhera',
          descriptionLocalizations: { 'en-US': "「📊」・Show Menhera's price list" },
          type: 'SUB_COMMAND_GROUP',
          options: [
            {
              name: 'comprar',
              nameLocalizations: { 'en-US': 'buy' },
              description: '「📈」・ Mostra os preços de itens de compras',
              descriptionLocalizations: { 'en-US': '「📈」・ Shows the prices of shopping items' },
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'tipo',
                  nameLocalizations: { 'en-US': 'type' },
                  description: 'Tipo da compra para precificar',
                  descriptionLocalizations: { 'en-US': 'Purchase type for pricing' },
                  type: 'STRING',
                  required: true,
                  choices: [
                    {
                      name: '🌈 | Cores',
                      nameLocalizations: { 'en-US': '🌈 | Colors' },
                      value: 'colors',
                    },
                    {
                      name: '🔑 | Rolls',
                      value: 'rolls',
                    },
                    {
                      name: '🔮 | Itens Mágicos',
                      nameLocalizations: { 'en-US': '🔮 | Magic Items' },
                      value: 'items',
                    },
                  ],
                },
              ],
            },
            {
              name: 'vender',
              nameLocalizations: { 'en-US': 'sell' },
              description: '「📈」・ Mostra os preços de itens de venda',
              descriptionLocalizations: { 'en-US': '「📈」・ Shows the prices of sale items' },
              type: 'SUB_COMMAND',
              options: [
                {
                  name: 'tipo',
                  nameLocalizations: { 'en-US': 'type' },
                  description: 'Tipo de vendas para precificar',
                  descriptionLocalizations: { 'en-US': 'Sales type to price' },
                  type: 'STRING',
                  required: true,
                  choices: [
                    {
                      name: '🐾 | Caças',
                      nameLocalizations: { 'en-US': '🐾 | Hunts' },
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

    if (!type) return ShopCommand.sellHunts(ctx);

    if (type === 'comprar') {
      const option = ctx.options.getSubcommand();

      if (option === 'cores') return ShopCommand.buyColor(ctx);

      if (option === 'rolls') return ShopCommand.buyRolls(ctx);

      if (option === 'itens') return ShopCommand.buyItems(ctx);

      if (option === 'temas') return ShopCommand.buyThemes(ctx);
    }

    if (type === 'preços') {
      const option = ctx.options.getSubcommand();

      if (option === 'comprar') return ShopCommand.buyInfo(ctx);

      if (option === 'vender') return ShopCommand.sellInfo(ctx);
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
      idle: 12000,
      filter,
    });

    collector.on('end', (_, reason) => {
      if (reason === 'idle') {
        ctx.makeMessage({
          components: [
            actionRow(disableComponents(ctx.locale('common:timesup'), components[0].components)),
          ],
        });
      }
    });

    collector.on('collect', async (int) => {
      const type = resolveCustomId(int.customId);

      switch (type) {
        case 'SELECT': {
          const selectedItem = getThemeById(Number((int as SelectMenuInteraction).values[0]));

          if (previewMode) {
            if (currentThemeType === 'profile') {
              int.deferReply({ ephemeral: true });
              const res = await requestPicassoImage(
                PicassoRoutes.Profile,
                {
                  user: ProfilePreview.user,
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
                ctx,
              );

              if (res.err) {
                await int
                  .followUp({
                    content: ctx.prettyResponse('error', 'common:http-error'),
                    ephemeral: true,
                  })
                  .catch(debugError);
                return;
              }

              await int
                .followUp({
                  files: [new MessageAttachment(res.data, 'profile-preview.png')],
                  ephemeral: true,
                })
                .catch(debugError);

              return;
            }

            const res = await requestPicassoImage(
              PicassoRoutes.Preview,
              {
                theme: selectedItem.data.theme,
                previewType: currentThemeType,
              },
              ctx,
            );

            if (res.err) {
              await ctx
                .send({
                  content: ctx.prettyResponse('error', 'common:http-error'),
                  ephemeral: true,
                })
                .catch(debugError);
              return;
            }

            await ctx
              .send({
                files: [new MessageAttachment(res.data, 'theme-preview.png')],
                ephemeral: true,
              })
              .catch(debugError);
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
          int.deferUpdate().catch(debugError);
          changeThemeType(0);
          break;
        case 'CARDS':
          int.deferUpdate().catch(debugError);
          changeThemeType(1);
          break;
        case 'BACKGROUND':
          int.deferUpdate().catch(debugError);
          changeThemeType(2);
          break;
        case 'TABLE':
          int.deferUpdate().catch(debugError);
          changeThemeType(3);
          break;
        case 'PREVIEW': {
          int.deferUpdate().catch(debugError);
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
      .addOptions(
        availableColors.reduce<MessageSelectOptionData[]>((p, c) => {
          if (ctx.data.user.colors.some((a) => a.cor === c.cor)) return p;

          p.push({
            label: c.nome.replaceAll('**', ''),
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
      false,
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

    const colorModal = new Modal()
      .setCustomId(`${ctx.interaction.id} | MODAL`)
      .setTitle(ctx.locale('commands:loja.buy_colors.title'));

    const hexInput = new TextInputComponent()
      .setCustomId('HEX')
      .setMinLength(6)
      .setMaxLength(7)
      .setPlaceholder('#F62B1C')
      .setRequired(true)
      .setLabel(ctx.locale('commands:loja.buy_colors.hex_input'))
      .setStyle('SHORT');

    const nameInput = new TextInputComponent()
      .setCustomId('NAME')
      .setMinLength(2)
      .setMaxLength(20)
      .setPlaceholder(ctx.locale('commands:loja.buy_colors.name_placeholder'))
      .setRequired(false)
      .setLabel(ctx.locale('commands:loja.buy_colors.name_input'))
      .setStyle('SHORT');

    colorModal.addComponents(
      { type: 1, components: [hexInput] },
      { type: 1, components: [nameInput] },
    );

    selected.showModal(colorModal);
    ctx.makeMessage({
      content: ctx.prettyResponse('time', 'common:waiting-form'),
      components: [],
    });

    const response = await ctx.awaitModalResponse(35_000);

    if (!response) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:form-timesup'),
        components: [],
        embeds: [],
      });
      return;
    }

    const hexColor = response.fields.getTextInputValue('HEX');
    const colorName =
      response.fields.getTextInputValue('NAME') ??
      ctx.locale('commands:loja.buy_colors.no-name', {
        number: ctx.data.user.colors.length,
      });

    if (
      ctx.data.user.colors.some(
        (a) => `${a.cor}`.replace('#', '') === hexColor.replace('#', '') || a.nome === colorName,
      )
    ) {
      ctx.makeMessage({
        content: ctx.prettyResponse('yellow_circle', 'commands:loja.buy_colors.has-color'),
        components: [],
      });
      return;
    }

    const isHexColor = (hex: string) => hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));

    if (!isHexColor(hexColor.replace('#', ''))) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.buy_colors.invalid-color'),
        components: [],
      });
      return;
    }

    const toPush = {
      nome: colorName,
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
  }
}
