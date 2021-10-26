import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

import { shopEconomy } from '@structures/Constants';
import { MessageEmbed } from 'discord.js-light';

export default class ShopInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
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
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const type = ctx.options.getSubcommandGroup(false);

    if (!type) {
      return this.sellHunts(ctx);
    }

    if (type === 'comprar') {
      const option = ctx.options.getSubcommand();
      if (option === 'cores') {
        return this.buyColor(ctx);
      }
      if (option === 'rolls') {
        return this.buyRolls(ctx);
      }
      if (option === 'itens') {
        return this.buyItems(ctx);
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

  async buyItems(ctx: InteractionCommandContext): Promise<void> {
    const embed = new MessageEmbed().setTitle('comprar');
    this.client.repositories.userRepository.update(ctx.author.id, {
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
      ctx.reply({ embeds: [dataCores] });
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
    ctx.reply({ embeds: [dataRolls] });
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
      ctx.reply({ embeds: [dataVender] });
    }
  }

  async sellHunts(ctx: InteractionCommandContext): Promise<void> {
    const valorDemonio = shopEconomy.hunts.demon;
    const valorGigante = shopEconomy.hunts.giant;
    const valorAnjo = shopEconomy.hunts.angel;
    const valorArch = shopEconomy.hunts.archangel;
    const valorSD = shopEconomy.hunts.demigod;
    const valorDeus = shopEconomy.hunts.god;

    const type = ctx.options.getString('tipo', true);
    const valor = ctx.options.getInteger('quantidade', true);

    if (Number.isNaN(valor) || valor < 1) {
      ctx.replyT('error', 'dataVender.invalid-args', {}, true);
      return;
    }

    switch (type) {
      case '1':
        if (valor > ctx.data.user.caçados) {
          ctx.replyT('error', 'dataVender.poor', { var: 'demônios' }, true);
          return;
        }
        this.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { caçados: -valor, estrelinhas: valor * valorDemonio },
        });
        ctx.replyT('success', 'dataVender.success-demon', {
          value: valor,
          cost: valor * valorDemonio,
          quantity: ctx.data.user.caçados - valor,
          star: ctx.data.user.estrelinhas + valor * valorDemonio,
        });
        break;
      case '2':
        if (valor > ctx.data.user.giants) {
          ctx.replyT('error', 'dataVender.poor', { var: 'gigantes' }, true);
          return;
        }
        this.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { giants: -valor, estrelinhas: valor * valorGigante },
        });
        ctx.replyT('success', 'dataVender.success-giant', {
          value: valor,
          cost: valor * valorGigante,
          quantity: ctx.data.user.giants - valor,
          star: ctx.data.user.estrelinhas + valor * valorGigante,
        });
        break;
      case '3':
        if (valor > ctx.data.user.anjos) {
          ctx.replyT('error', 'dataVender.poor', { var: 'anjos' }, true);
          return;
        }
        this.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { anjos: -valor, estrelinhas: valor * valorAnjo },
        });
        ctx.replyT('success', 'dataVender.success-angel', {
          value: valor,
          cost: valor * valorAnjo,
          quantity: ctx.data.user.anjos - valor,
          star: ctx.data.user.estrelinhas + valor * valorAnjo,
        });
        break;
      case '4':
        if (valor > ctx.data.user.arcanjos) {
          ctx.replyT('error', 'dataVender.poor', { var: 'arcanjos' }, true);
          return;
        }
        this.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { arcanjos: -valor, estrelinhas: valor * valorArch },
        });
        ctx.replyT('success', 'dataVender.success-archangel', {
          value: valor,
          cost: valor * valorArch,
          quantity: ctx.data.user.arcanjos - valor,
          star: ctx.data.user.estrelinhas + valor * valorArch,
        });
        break;
      case '5':
        if (valor > ctx.data.user.semideuses) {
          ctx.replyT('error', 'dataVender.poor', { var: 'semideuses' }, true);
          return;
        }
        this.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { semideuses: -valor, estrelinhas: valor * valorSD },
        });
        ctx.replyT('success', 'dataVender.success-sd', {
          value: valor,
          cost: valor * valorSD,
          quantity: ctx.data.user.semideuses - valor,
          star: ctx.data.user.estrelinhas + valor * valorSD,
        });
        break;
      case '6':
        if (valor > ctx.data.user.deuses) {
          ctx.replyT('error', 'dataVender.poor', { var: 'deuses' }, true);
          return;
        }
        this.client.repositories.userRepository.update(ctx.author.id, {
          $inc: { deuses: -valor, estrelinhas: valor * valorDeus },
        });
        ctx.replyT('success', 'dataVender.success-god', {
          value: valor,
          cost: valor * valorDeus,
          quantity: ctx.data.user.deuses - valor,
          star: ctx.data.user.estrelinhas + valor * valorDeus,
        });
        break;
      default:
        ctx.replyT('error', 'dataVender.invalid-args', {}, true);
    }
  }

  async buyRolls(ctx: InteractionCommandContext): Promise<void> {
    const valorRoll = shopEconomy.hunts.roll;

    const valor = ctx.options.getInteger('quantidade', true);

    if (!valor) {
      ctx.replyT('error', 'dataRolls_fields.buy_rolls.invalid-number', {}, true);
      return;
    }
    if (Number.isNaN(valor) || valor < 1) {
      ctx.replyT('error', 'dataRolls_fields.buy_rolls.invalid-number', {}, true);
      return;
    }

    if (valor * valorRoll > ctx.data.user.estrelinhas) {
      ctx.replyT('error', 'dataRolls_fields.buy_rolls.poor', {}, true);
      return;
    }

    const valueToPay = valor * valorRoll;

    this.client.repositories.userRepository.update(ctx.author.id, {
      $inc: { rolls: valor, estrelinhas: -valueToPay },
    });

    ctx.replyT('success', 'dataRolls_fields.buy_rolls.success', {
      quantity: valor,
      value: valueToPay,
      rolls: ctx.data.user.rolls + valor,
      stars: ctx.data.user.estrelinhas - valueToPay,
    });
  }

  async buyColor(ctx: InteractionCommandContext): Promise<void> {
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
        if (ctx.data.user.cores.some((res) => res.cor === availableColors[0].cor)) {
          ctx.replyT('yellow_circle', 'buy_colors.has-color', {}, true);
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[0].price) {
          ctx.replyT('error', 'buy_colors.poor', {}, true);
          return;
        }
        choice = 0;
        break;
      case '2':
        if (ctx.data.user.cores.some((res) => res.cor === availableColors[1].cor)) {
          ctx.replyT('yellow_circle', 'buy_colors.has-color', {}, true);
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[1].price) {
          ctx.replyT('error', 'buy_colors.poor', {}, true);
          return;
        }

        choice = 1;
        break;
      case '3':
        if (ctx.data.user.cores.some((res) => res.cor === availableColors[2].cor)) {
          ctx.replyT('yellow_circle', 'buy_colors.has-color', {}, true);
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[2].price) {
          ctx.replyT('error', 'buy_colors.poor', {}, true);
          return;
        }
        choice = 2;
        break;
      case '4':
        if (ctx.data.user.cores.some((res) => res.cor === availableColors[3].cor)) {
          ctx.replyT('yellow_circle', 'buy_colors.has-color', {}, true);
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[3].price) {
          ctx.replyT('error', 'buy_colors.poor', {}, true);
          return;
        }
        choice = 3;
        break;
      case '5':
        if (ctx.data.user.cores.some((res) => res.cor === availableColors[4].cor)) {
          ctx.replyT('yellow_circle', 'buy_colors.has-color', {}, true);
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[4].price) {
          ctx.replyT('error', 'buy_colors.poor', {}, true);
          return;
        }
        choice = 4;
        break;
      case '6':
        if (ctx.data.user.cores.some((res) => res.cor === availableColors[5].cor)) {
          ctx.replyT('yellow_circle', 'buy_colors.has-color', {}, true);
          return;
        }
        if (ctx.data.user.estrelinhas < availableColors[5].price) {
          ctx.replyT('error', 'buy_colors.poor', {}, true);
          return;
        }
        choice = 5;
        break;

      case '7': {
        if (ctx.data.user.estrelinhas < availableColors[6].price) {
          ctx.replyT('error', 'buy_colors.poor', {}, true);
          return;
        }
        choice = 6;

        const hexColor = ctx.options.getString('hex');

        const name =
          ctx.options.getString('nome')?.slice(0, 20) ?? ctx.translate('buy_colors.no-name');

        if (!hexColor) {
          ctx.replyT('error', 'buy_colors.invalid-color', {}, true);
          return;
        }

        if (
          ctx.data.user.cores.some((a) => `${a.cor}`.replace('#', '') === hexColor.replace('#', ''))
        ) {
          ctx.replyT('yellow_circle', 'buy_colors.has-color', {}, true);
          return;
        }

        const isHexColor = (hex: string) => hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));

        if (isHexColor(hexColor.replace('#', ''))) {
          const toPush = {
            nome: name,
            cor: `#${hexColor.replace('#', '')}`,
            price: shopEconomy.colors.your_choice,
          };
          this.client.repositories.userRepository.update(ctx.author.id, {
            $inc: { estrelinhas: -availableColors[6].price },
            $push: { cores: toPush },
          });
          ctx.replyT('success', 'buy_colors.yc-confirm', {
            color: hexColor,
            price: availableColors[6].price,
            stars: ctx.data.user.estrelinhas - availableColors[6].price,
          });
        } else {
          ctx.replyT('error', 'buy_colors.invalid-color', {}, true);
        }
      }
    }
    if (choice !== 6) {
      await this.client.repositories.userRepository.update(ctx.author.id, {
        $inc: { estrelinhas: -availableColors[choice].price },
        $push: { cores: availableColors[choice] },
      });
      ctx.replyT('success', 'buy_colors.buy-success', {
        name: availableColors[choice].nome,
        price: availableColors[choice].price,
        stars: ctx.data.user.estrelinhas - availableColors[choice].price,
      });
    }
  }
}
