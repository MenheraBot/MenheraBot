import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

import { emojis, shopEconomy } from '@structures/Constants';
import { HuntingTypes } from '@utils/Types';
import Util, { actionRow } from '@utils/Util';
import {
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
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
                      name: 'Cores',
                      value: '1',
                    },
                    {
                      name: 'Rolls',
                      value: '2',
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
                      name: 'Caças',
                      value: '1',
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
      ],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getSubcommandGroup(false);

    if (!type) {
      return ShopInteractionCommand.sellHunts(ctx);
    }

    if (type === 'comprar') {
      const option = ctx.options.getSubcommand();
      if (option === 'cores') {
        return ShopInteractionCommand.buyColor(ctx);
      }
      if (option === 'rolls') {
        return ShopInteractionCommand.buyRolls(ctx);
      }
      if (option === 'itens') {
        return ShopInteractionCommand.buyItems(ctx);
      }
    }

    if (type === 'info') {
      const option = ctx.options.getSubcommand();
      if (option === 'comprar') {
        return ShopInteractionCommand.buyInfo(ctx);
      }

      if (option === 'vender') {
        return ShopInteractionCommand.sellInfo(ctx);
      }
    }
  }

  static async buyItems(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed().setTitle('comprar');
    ctx.client.repositories.userRepository.update(ctx.author.id, {
      inventory: [{ id: 1, amount: 1 }],
    });
    ctx.makeMessage({ embeds: [embed] });
  }

  static async buyInfo(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);

    if (type === '1') {
      const availableColors = [
        {
          cor: '#6308c0',
          price: shopEconomy.colors.purple,
          nome: `**${ctx.translate('colors.purple')}**`,
        },
        {
          cor: '#df0509',
          price: shopEconomy.colors.red,
          nome: `**${ctx.translate('colors.red')}**`,
        },
        {
          cor: '#55e0f7',
          price: shopEconomy.colors.cian,
          nome: `**${ctx.translate('colors.cian')}**`,
        },
        {
          cor: '#03fd1c',
          price: shopEconomy.colors.green,
          nome: `**${ctx.translate('colors.green')}**`,
        },
        {
          cor: '#fd03c9',
          price: shopEconomy.colors.pink,
          nome: `**${ctx.translate('colors.pink')}**`,
        },
        {
          cor: '#e2ff08',
          price: shopEconomy.colors.yellow,
          nome: `**${ctx.translate('colors.yellow')}**`,
        },
        {
          cor: 'SUA ESCOLHA',
          price: shopEconomy.colors.your_choice,
          nome: `**${ctx.translate('colors.your_choice')}**`,
        },
      ];

      const dataCores = {
        title: ctx.translate('dataCores_fields.title'),
        color: '#6cbe50' as const,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        fields: [
          {
            name: ctx.translate('dataCores_fields.field_name'),
            value: availableColors
              .map(
                (c) =>
                  `${c.nome} | ${ctx.translate('dataCores_fields.color_code')} \`${
                    c.cor
                  }\` | ${ctx.translate('dataCores_fields.price')} **${c.price}**⭐`,
              )
              .join('\n'),
            inline: false,
          },
        ],
      };
      ctx.makeMessage({ embeds: [dataCores] });
      return;
    }

    const valorRoll = shopEconomy.hunts.roll;
    const dataRolls = {
      title: ctx.translate('dataRolls_fields.title'),
      color: '#b66642' as const,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      fields: [
        {
          name: ctx.translate('dataRolls_fields.fields.name'),
          value: ctx.translate('dataRolls_fields.fields.value', {
            price: valorRoll,
          }),
          inline: false,
        },
      ],
    };
    ctx.makeMessage({ embeds: [dataRolls] });
  }

  static async sellInfo(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getString('tipo', true);

    if (type === '1') {
      const dataVender = {
        title: ctx.translate('embed_title'),
        color: '#e77fa1' as const,
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        fields: [
          {
            name: ctx.translate('dataVender.main.fields.name'),
            value: ctx.translate('dataVender.main.fields.value', {
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
    const type = ctx.options.getString('tipo', true) as HuntingTypes;
    const valor = ctx.options.getInteger('quantidade', true);

    if (Number.isNaN(valor) || valor < 1) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'dataVender.invalid-args'),
        ephemeral: true,
      });
      return;
    }

    if (valor > ctx.data.user[type]) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'dataVender.poor', {
          var: ctx.locale(`common:${type}`),
        }),
        ephemeral: true,
      });
      return;
    }

    ctx.client.repositories.userRepository.update(ctx.author.id, {
      $inc: { [type]: -valor, estrelinhas: valor * shopEconomy.hunts[type] },
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'dataVender.success', {
        value: valor,
        cost: valor * shopEconomy.hunts[type],
        quantity: ctx.data.user[type] - valor,
        hunt: ctx.locale(`common:${type}`),
        emoji: emojis[type],
        star: ctx.data.user.estrelinhas + valor * shopEconomy.hunts[type],
      }),
      ephemeral: true,
    });
  }

  static async buyRolls(ctx: InteractionCommandContext): Promise<void> {
    const valorRoll = shopEconomy.hunts.roll;

    const valor = ctx.options.getInteger('quantidade', true);

    if (!valor) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'dataRolls_fields.buy_rolls.invalid-number'),
        ephemeral: true,
      });
      return;
    }
    if (Number.isNaN(valor) || valor < 1) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'dataRolls_fields.buy_rolls.invalid-number'),
        ephemeral: true,
      });
      return;
    }

    if (valor * valorRoll > ctx.data.user.estrelinhas) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'dataRolls_fields.buy_rolls.poor'),
        ephemeral: true,
      });
      return;
    }

    const valueToPay = valor * valorRoll;

    ctx.client.repositories.userRepository.update(ctx.author.id, {
      $inc: { rolls: valor, estrelinhas: -valueToPay },
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'dataRolls_fields.buy_rolls.success', {
        quantity: valor,
        value: valueToPay,
        rolls: ctx.data.user.rolls + valor,
        stars: ctx.data.user.estrelinhas - valueToPay,
      }),
    });
  }

  static async buyColor(ctx: InteractionCommandContext): Promise<void> {
    const availableColors = [
      {
        cor: '#6308c0',
        price: shopEconomy.colors.purple,
        nome: `**${ctx.translate('colors.purple')}**`,
      },
      {
        cor: '#df0509',
        price: shopEconomy.colors.red,
        nome: `**${ctx.translate('colors.red')}**`,
      },
      {
        cor: '#55e0f7',
        price: shopEconomy.colors.cian,
        nome: `**${ctx.translate('colors.cian')}**`,
      },
      {
        cor: '#03fd1c',
        price: shopEconomy.colors.green,
        nome: `**${ctx.translate('colors.green')}**`,
      },
      {
        cor: '#fd03c9',
        price: shopEconomy.colors.pink,
        nome: `**${ctx.translate('colors.pink')}**`,
      },
      {
        cor: '#e2ff08',
        price: shopEconomy.colors.yellow,
        nome: `**${ctx.translate('colors.yellow')}**`,
      },
      {
        cor: ctx.translate('colors.your_choice').replace('7 - ', ''),
        price: shopEconomy.colors.your_choice,
        nome: `**${ctx.translate('colors.your_choice')}**`,
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
      content: ctx.prettyResponse('question', ctx.translate('buy_colors.buy-text')),
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
        content: ctx.prettyResponse('error', 'buy_colors.poor'),
        components: [],
      });
      return;
    }

    if (chosenColor.cor.startsWith('#')) {
      await ctx.client.repositories.userRepository.update(ctx.author.id, {
        $inc: { estrelinhas: -chosenColor.price },
        $push: { colors: { nome: chosenColor.nome, cor: chosenColor.cor } },
      });

      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'buy_colors.buy-success', {
          name: chosenColor.nome,
          price: chosenColor.price,
          stars: ctx.data.user.estrelinhas - chosenColor.price,
        }),
      });
      return;
    }

    const hexColor = ctx.options.getString('hex');

    const name =
      ctx.options.getString('nome')?.slice(0, 20) ??
      ctx.translate('buy_colors.no-name', { number: ctx.data.user.colors.length });

    if (!hexColor) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'buy_colors.invalid-color'),
      });
      return;
    }

    if (
      ctx.data.user.colors.some(
        (a) => `${a.cor}`.replace('#', '') === hexColor.replace('#', '') || a.nome === name,
      )
    ) {
      ctx.makeMessage({
        content: ctx.prettyResponse('yellow_circle', 'buy_colors.has-color'),
      });
      return;
    }

    const isHexColor = (hex: string) => hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));

    if (isHexColor(hexColor.replace('#', ''))) {
      const toPush = {
        nome: name,
        cor: `#${hexColor.replace('#', '')}`,
      };
      ctx.client.repositories.userRepository.update(ctx.author.id, {
        $inc: { estrelinhas: -chosenColor.price },
        $push: { colors: toPush },
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'buy_colors.yc-confirm', {
          color: hexColor,
          price: chosenColor.price,
          stars: ctx.data.user.estrelinhas - chosenColor.price,
        }),
      });
    } else {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'buy_colors.invalid-color'),
      });
    }
  }
}
