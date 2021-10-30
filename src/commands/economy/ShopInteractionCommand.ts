import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

import { shopEconomy } from '@structures/Constants';
import { MessageEmbed } from 'discord.js-light';

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
                  name: 'cor',
                  description: 'Cor para comprar',
                  type: 'STRING',
                  required: true,
                  choices: [
                    {
                      name: 'Roxo Escuro',
                      value: '1',
                    },
                    {
                      name: 'Vermelho',
                      value: '2',
                    },
                    {
                      name: 'Ciano',
                      value: '3',
                    },
                    {
                      name: 'Verde Neon',
                      value: '4',
                    },
                    {
                      name: 'Rosa Choque',
                      value: '5',
                    },
                    {
                      name: 'Amarelo',
                      value: '6',
                    },
                    {
                      name: 'Sua Escolha',
                      value: '7',
                    },
                  ],
                },
                {
                  name: 'hex',
                  description: 'Código da cor ao comprar a opção 7',
                  type: 'STRING',
                  required: false,
                },
                {
                  name: 'nome',
                  description: 'Nome da cor para a identificar. Máximo 20 caracteres',
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
                  name: 'Demônios',
                  value: '1',
                },
                {
                  name: 'Gigantes',
                  value: '2',
                },
                {
                  name: 'Anjos',
                  value: '3',
                },
                {
                  name: 'Arcanjos',
                  value: '4',
                },
                {
                  name: 'Semideuses',
                  value: '5',
                },
                {
                  name: 'Deuses',
                  value: '6',
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
      const valorDemonio = shopEconomy.hunts.demon;
      const valorGigante = shopEconomy.hunts.giant;
      const valorAnjo = shopEconomy.hunts.angel;
      const valorArch = shopEconomy.hunts.archangel;
      const valorSD = shopEconomy.hunts.demigod;
      const valorDeus = shopEconomy.hunts.god;

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
              demon: valorDemonio,
              giant: valorGigante,
              angel: valorAnjo,
              archangel: valorArch,
              demi: valorSD,
              god: valorDeus,
            }),
            inline: false,
          },
        ],
      };
      ctx.makeMessage({ embeds: [dataVender] });
    }
  }

  static async sellHunts(ctx: InteractionCommandContext): Promise<void> {
    const valorDemonio = shopEconomy.hunts.demon;
    const valorGigante = shopEconomy.hunts.giant;
    const valorAnjo = shopEconomy.hunts.angel;
    const valorArch = shopEconomy.hunts.archangel;
    const valorSD = shopEconomy.hunts.demigod;
    const valorDeus = shopEconomy.hunts.god;

    const type = ctx.options.getString('tipo', true);
    const valor = ctx.options.getInteger('quantidade', true);

    if (Number.isNaN(valor) || valor < 1) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'dataVender.invalid-args'),
        ephemeral: true,
      });
      return;
    }

    switch (type) {
      case '1':
        if (valor > ctx.data.user.demons) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'dataVender.poor', { var: 'demônios' }),
            ephemeral: true,
          });
          return;
        }
        ctx.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { caçados: -valor, estrelinhas: valor * valorDemonio },
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'dataVender.success-demon', {
            value: valor,
            cost: valor * valorDemonio,
            quantity: ctx.data.user.demons - valor,
            star: ctx.data.user.estrelinhas + valor * valorDemonio,
          }),
          ephemeral: true,
        });
        break;
      case '2':
        if (valor > ctx.data.user.giants) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'dataVender.poor', { var: 'gigantes' }),
            ephemeral: true,
          });
          return;
        }
        ctx.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { giants: -valor, estrelinhas: valor * valorGigante },
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'dataVender.success-giant', {
            value: valor,
            cost: valor * valorGigante,
            quantity: ctx.data.user.giants - valor,
            star: ctx.data.user.estrelinhas + valor * valorGigante,
          }),
          ephemeral: true,
        });
        break;
      case '3':
        if (valor > ctx.data.user.angels) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'dataVender.poor', { var: 'anjos' }),
            ephemeral: true,
          });
          return;
        }
        ctx.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { anjos: -valor, estrelinhas: valor * valorAnjo },
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'dataVender.success-angel', {
            value: valor,
            cost: valor * valorAnjo,
            quantity: ctx.data.user.angels - valor,
            star: ctx.data.user.estrelinhas + valor * valorAnjo,
          }),
          ephemeral: true,
        });
        break;
      case '4':
        if (valor > ctx.data.user.archangels) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'dataVender.poor', { var: 'arcanjos' }),
            ephemeral: true,
          });
          return;
        }
        ctx.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { arcanjos: -valor, estrelinhas: valor * valorArch },
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'dataVender.success-archangel', {
            value: valor,
            cost: valor * valorArch,
            quantity: ctx.data.user.archangels - valor,
            star: ctx.data.user.estrelinhas + valor * valorArch,
          }),
        });
        break;
      case '5':
        if (valor > ctx.data.user.demigods) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'dataVender.poor', { var: 'semideuses' }),
            ephemeral: true,
          });
          return;
        }
        ctx.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { semideuses: -valor, estrelinhas: valor * valorSD },
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'dataVender.success-sd', {
            value: valor,
            cost: valor * valorSD,
            quantity: ctx.data.user.demigods - valor,
            star: ctx.data.user.estrelinhas + valor * valorSD,
          }),
        });
        break;
      case '6':
        if (valor > ctx.data.user.gods) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'dataVender.poor', { var: 'deuses' }),
            ephemeral: true,
          });
          return;
        }
        ctx.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { deuses: -valor, estrelinhas: valor * valorDeus },
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('success', 'dataVender.success-god', {
            value: valor,
            cost: valor * valorDeus,
            quantity: ctx.data.user.gods - valor,
            star: ctx.data.user.estrelinhas + valor * valorDeus,
          }),
        });
        break;
      default:
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'dataVender.invalid-args'),
          ephemeral: true,
        });
    }
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
        cor: 'SUA ESCOLHA',
        price: shopEconomy.colors.your_choice,
        nome: `**${ctx.translate('colors.your_choice')}**`,
      },
    ];

    const selectedColor = ctx.options.getString('cor');

    let choice = 0;

    switch (selectedColor) {
      case '1':
        if (ctx.data.user.colors.some((res) => res.cor === availableColors[0].cor)) {
          ctx.makeMessage({
            content: ctx.prettyResponse('yellow_circle', 'buy_colors.has-color'),
            ephemeral: true,
          });
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[0].price) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.poor'),
            ephemeral: true,
          });
          return;
        }
        choice = 0;
        break;
      case '2':
        if (ctx.data.user.colors.some((res) => res.cor === availableColors[1].cor)) {
          ctx.makeMessage({
            content: ctx.prettyResponse('yellow_circle', 'buy_colors.has-color'),
            ephemeral: true,
          });
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[1].price) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.poor'),
            ephemeral: true,
          });
          return;
        }

        choice = 1;
        break;
      case '3':
        if (ctx.data.user.colors.some((res) => res.cor === availableColors[2].cor)) {
          ctx.makeMessage({
            content: ctx.prettyResponse('yellow_circle', 'buy_colors.has-color'),
            ephemeral: true,
          });
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[2].price) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.poor'),
            ephemeral: true,
          });
          return;
        }
        choice = 2;
        break;
      case '4':
        if (ctx.data.user.colors.some((res) => res.cor === availableColors[3].cor)) {
          ctx.makeMessage({
            content: ctx.prettyResponse('yellow_circle', 'buy_colors.has-color'),
            ephemeral: true,
          });
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[3].price) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.poor'),
            ephemeral: true,
          });
          return;
        }
        choice = 3;
        break;
      case '5':
        if (ctx.data.user.colors.some((res) => res.cor === availableColors[4].cor)) {
          ctx.makeMessage({
            content: ctx.prettyResponse('yellow_circle', 'buy_colors.has-color'),
            ephemeral: true,
          });
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[4].price) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.poor'),
            ephemeral: true,
          });
          return;
        }
        choice = 4;
        break;
      case '6':
        if (ctx.data.user.colors.some((res) => res.cor === availableColors[5].cor)) {
          ctx.makeMessage({
            content: ctx.prettyResponse('yellow_circle', 'buy_colors.has-color'),
            ephemeral: true,
          });
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[5].price) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.poor'),
            ephemeral: true,
          });
          return;
        }
        choice = 5;
        break;

      case '7': {
        if (ctx.data.user.estrelinhas < availableColors[6].price) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.poor'),
            ephemeral: true,
          });
          return;
        }
        choice = 6;

        const hexColor = ctx.options.getString('hex');

        const name =
          ctx.options.getString('nome')?.slice(0, 20) ?? ctx.translate('buy_colors.no-name');

        if (!hexColor) {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.invalid-color'),
            ephemeral: true,
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
            ephemeral: true,
          });
          return;
        }

        const isHexColor = (hex: string) => hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));

        if (isHexColor(hexColor.replace('#', ''))) {
          const toPush = {
            nome: name,
            cor: `#${hexColor.replace('#', '')}`,
            price: shopEconomy.colors.your_choice,
          };
          ctx.client.repositories.userRepository.update(ctx.author.id, {
            $inc: { estrelinhas: -availableColors[6].price },
            $push: { cores: toPush },
          });
          ctx.makeMessage({
            content: ctx.prettyResponse('success', 'buy_colors.yc-confirm', {
              color: hexColor,
              price: availableColors[6].price,
              stars: ctx.data.user.estrelinhas - availableColors[6].price,
            }),
          });
        } else {
          ctx.makeMessage({
            content: ctx.prettyResponse('error', 'buy_colors.invalid-color'),
            ephemeral: true,
          });
        }
      }
    }
    if (choice !== 6) {
      await ctx.client.repositories.userRepository.update(ctx.author.id, {
        $inc: { estrelinhas: -availableColors[choice].price },
        $push: { cores: availableColors[choice] },
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('success', 'buy_colors.buy-success', {
          name: availableColors[choice].nome,
          price: availableColors[choice].price,
          stars: ctx.data.user.estrelinhas - availableColors[choice].price,
        }),
      });
    }
  }
}
