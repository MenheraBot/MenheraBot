import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

import { COLORS, emojis, shopEconomy } from '@structures/Constants';
import MagicItems from '@structures/MagicItems';
import { HuntingTypes } from '@utils/Types';
import Util, { actionRow } from '@utils/Util';
import {
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
  ColorResolvable,
} from 'discord.js-light';

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
                },
              ],
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
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
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
    }

    if (type === 'info') {
      const option = ctx.options.getSubcommand();

      if (option === 'comprar') return ShopInteractionCommand.buyInfo(ctx);

      if (option === 'vender') return ShopInteractionCommand.sellInfo(ctx);
    }
  }

  static async buyItems(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:loja.buy_item.title'))
      .setDescription(ctx.locale('commands:loja.buy_item.description'));

    const selectMenu = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | BUY`)
      .setMinValues(1)
      .setMaxValues(1);

    for (let i = 1; i <= 6; i++) {
      if (
        !ctx.data.user.inventory.some((a) => a.id === i) ||
        !ctx.data.user.inUseItems.some((a) => a.id === i)
      ) {
        selectMenu.addOptions({
          label: ctx.locale(`data:magic-items.${i as 1}.name`),
          value: `${i}`,
          description: `${MagicItems[i].cost} ${emojis.estrelinhas}`,
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
      15000,
    );

    if (!choice) {
      ctx.makeMessage({
        components: [
          actionRow([selectMenu.setDisabled(true).setPlaceholder(ctx.locale('common:timesup'))]),
        ],
      });
      return;
    }

    const selectedItem = Number(choice.values);

    if (MagicItems[selectedItem].cost > ctx.data.user.estrelinhas) {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.prettyResponse('error', 'commands:loja.dataVender.poor'),
      });
      return;
    }

    ctx.client.repositories.shopRepository.buyItem(
      ctx.author.id,
      selectedItem,
      MagicItems[selectedItem].cost,
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
            cost: MagicItems[i].cost,
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
      ephemeral: true,
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
      });

      ctx.client.repositories.shopRepository.buyColor(ctx.author.id, chosenColor.price, toPush);
    } else {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:loja.buy_colors.invalid-color'),
      });
    }
  }
}
