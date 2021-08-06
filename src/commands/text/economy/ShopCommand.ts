import Command from '@structures/command/Command';
import CommandContext from '@structures/command/CommandContext';
import MenheraClient from 'MenheraClient';
import { shopEconomy } from '@structures/MenheraConstants';
import { ColorResolvable, Message } from 'discord.js';
import UserRepository from '@database/repositories/UserRepository';

export default class ShopCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'shop',
      aliases: ['loja'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'economia',
    });
  }

  static async lojaComprar(
    ctx: CommandContext,
    embedMessage: Message,
    repo: UserRepository,
  ): Promise<Message | void> {
    const saldoAtual = ctx.data.user.estrelinhas;
    const dataComprar = {
      title: ctx.locale('commands:shop.embed_title'),
      color: '#6cbe50' as ColorResolvable,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: ctx.locale('commands:shop.embed_description_saldo', { value: saldoAtual }),
      footer: {
        text: ctx.locale('commands:shop.embed_footer'),
      },
      fields: [
        {
          name: ctx.locale('commands:shop.dataComprar_fields.name'),
          value: ctx.locale('commands:shop.dataComprar_fields.value'),
          inline: false,
        },
      ],
    };
    embedMessage
      .edit({ content: ctx.message.author.toString(), embeds: [dataComprar] })
      .catch(() => null);

    const validBuyArgs = ['1', '2'];

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector({ filter, max: 1, time: 30000 });

    collector.on('collect', async (m) => {
      if (!validBuyArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) {
        ctx.replyT('error', 'commands:shop.invalid-option');
        return;
      }

      if (m.content === '1') {
        // abre loja de cores

        const availableColors = [
          {
            cor: '#6308c0',
            price: shopEconomy.colors.purple,
            nome: `**${ctx.locale('commands:shop.colors.purple')}**`,
          },
          {
            cor: '#df0509',
            price: shopEconomy.colors.red,
            nome: `**${ctx.locale('commands:shop.colors.red')}**`,
          },
          {
            cor: '#55e0f7',
            price: shopEconomy.colors.cian,
            nome: `**${ctx.locale('commands:shop.colors.cian')}**`,
          },
          {
            cor: '#03fd1c',
            price: shopEconomy.colors.green,
            nome: `**${ctx.locale('commands:shop.colors.green')}**`,
          },
          {
            cor: '#fd03c9',
            price: shopEconomy.colors.pink,
            nome: `**${ctx.locale('commands:shop.colors.pink')}**`,
          },
          {
            cor: '#e2ff08',
            price: shopEconomy.colors.yellow,
            nome: `**${ctx.locale('commands:shop.colors.yellow')}**`,
          },
          {
            cor: 'SUA ESCOLHA',
            price: shopEconomy.colors.your_choice,
            nome: `**${ctx.locale('commands:shop.colors.your_choice')}**`,
          },
        ];

        const dataCores = {
          title: ctx.locale('commands:shop.dataCores_fields.title'),
          color: '#6cbe50' as ColorResolvable,
          thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png',
          },
          description: ctx.locale('commands:shop.embed_description_saldo', { value: saldoAtual }),
          footer: {
            text: ctx.locale('commands:shop.embed_footer'),
          },
          fields: [
            {
              name: ctx.locale('commands:shop.dataCores_fields.field_name'),
              value: availableColors
                .map(
                  (c) =>
                    `${c.nome} | ${ctx.locale('commands:shop.dataCores_fields.color_code')} \`${
                      c.cor
                    }\` | ${ctx.locale('commands:shop.dataCores_fields.price')} **${c.price}**⭐`,
                )
                .join('\n'),
              inline: false,
            },
          ],
        };
        await embedMessage.edit({ embeds: [dataCores] });

        const validCorArgs = ['1', '2', '3', '4', '5', '6', '7'];

        const filtroCor = (msg: Message) => msg.author.id === ctx.message.author.id;
        const CorColetor = ctx.message.channel.createMessageCollector({
          filter: filtroCor,
          max: 1,
          time: 30000,
        });

        CorColetor.on('collect', async (msg) => {
          if (!validCorArgs.includes(msg.content)) {
            await ctx.replyT('error', 'commands:shop.invalid-option');
            return;
          }
          let choice = 0;
          switch (msg.content) {
            case '1':
              if (ctx.data.user.cores.some((res) => res.cor === availableColors[0].cor)) {
                ctx
                  .replyT('yellow_circle', 'commands:shop.buy_colors.has-color')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              if (ctx.data.user.estrelinhas < availableColors[0].price) {
                ctx
                  .replyT('error', 'commands:shop.buy_colors.poor')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              choice = 0;
              break;
            case '2':
              if (ctx.data.user.cores.some((res) => res.cor === availableColors[1].cor)) {
                ctx
                  .replyT('yellow_circle', 'commands:shop.buy_colors.has-color')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              if (ctx.data.user.estrelinhas < availableColors[1].price) {
                ctx
                  .replyT('error', 'commands:shop.buy_colors.poor')
                  .then(() => embedMessage.delete().catch());
                return;
              }

              choice = 1;
              break;
            case '3':
              if (ctx.data.user.cores.some((res) => res.cor === availableColors[2].cor)) {
                ctx
                  .replyT('yellow_circle', 'commands:shop.buy_colors.has-color')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              if (ctx.data.user.estrelinhas < availableColors[2].price) {
                ctx
                  .replyT('error', 'commands:shop.buy_colors.poor')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              choice = 2;
              break;
            case '4':
              if (ctx.data.user.cores.some((res) => res.cor === availableColors[3].cor)) {
                ctx
                  .replyT('yellow_circle', 'commands:shop.buy_colors.has-color')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              if (ctx.data.user.estrelinhas < availableColors[3].price) {
                ctx
                  .replyT('error', 'commands:shop.buy_colors.poor')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              choice = 3;
              break;
            case '5':
              if (ctx.data.user.cores.some((res) => res.cor === availableColors[4].cor)) {
                ctx
                  .reply('yellow_circle', 'commands:shop.buy_colors.has-color')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              if (ctx.data.user.estrelinhas < availableColors[4].price) {
                ctx
                  .replyT('error', 'commands:shop.buy_colors.poor')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              choice = 4;
              break;
            case '6':
              if (ctx.data.user.cores.some((res) => res.cor === availableColors[5].cor)) {
                ctx
                  .replyT('yellow_circle', 'commands:shop.buy_colors.has-color')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              if (ctx.data.user.estrelinhas < availableColors[5].price) {
                ctx
                  .replyT('error', 'commands:shop.buy_colors.poor')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              choice = 5;
              break;

            case '7': {
              if (ctx.data.user.cores.some((res) => res.nome.startsWith('7'))) {
                ctx
                  .replyT('yellow_circle', 'commands:shop.buy_colors.has-color')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              if (ctx.data.user.estrelinhas < availableColors[6].price) {
                ctx
                  .replyT('error', 'commands:shop.buy_colors.poor')
                  .then(() => embedMessage.delete().catch());
                return;
              }
              choice = 6;

              const hexFiltro = (hexMsg: Message) => hexMsg.author.id === ctx.message.author.id;
              const hexColletor = ctx.message.channel.createMessageCollector({
                filter: hexFiltro,
                max: 1,
                time: 30000,
              });
              await ctx.send(ctx.locale('commands:shop.buy_colors.yc-message'));

              hexColletor.on('collect', (hexMsg: Message) => {
                const isHexColor = (hex: string) =>
                  hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));
                if (isHexColor(hexMsg.content)) {
                  const toPush = {
                    nome: '7 - Sua Escolha',
                    cor: `#${hexMsg.content}`,
                    price: shopEconomy.colors.your_choice,
                  };
                  repo.update(ctx.message.author.id, {
                    $inc: { estrelinhas: -availableColors[6].price },
                    $push: { cores: toPush },
                  });
                  ctx
                    .replyT('success', 'commands:shop.buy_colors.yc-confirm', {
                      color: hexMsg.content,
                      price: availableColors[6].price,
                      stars: ctx.data.user.estrelinhas - availableColors[6].price,
                    })
                    .then(() => embedMessage.delete().catch);
                } else {
                  ctx
                    .replyT('error', 'commands:shop.buy_colors.invalid-color')
                    .then(() => embedMessage.delete().catch());
                }
              });
            }
          }
          if (choice !== 6) {
            await repo.update(ctx.message.author.id, {
              $inc: { estrelinhas: -availableColors[choice].price },
              $push: { cores: availableColors[choice] },
            });
            ctx
              .replyT('success', 'commands:shop.buy_colors.buy-success', {
                name: availableColors[choice].nome,
                price: availableColors[choice].price,
                stars: ctx.data.user.estrelinhas - availableColors[choice].price,
              })
              .then(() => embedMessage.delete().catch());
          }
        });
      } else {
        // abre loja de rolls

        const valorRoll = shopEconomy.hunts.roll;
        const rollsAtual = ctx.data.user.rolls;

        const dataRolls = {
          title: ctx.locale('commands:shop.dataRolls_fields.title'),
          color: '#b66642' as ColorResolvable,
          thumbnail: {
            url: 'https://i.imgur.com/t94XkgG.png',
          },
          description: ctx.locale('commands:shop.dataRolls_fields.description', {
            saldo: saldoAtual,
            rolls: rollsAtual,
          }),
          footer: {
            text: ctx.locale('commands:shop.dataRolls_fields.footer'),
          },
          fields: [
            {
              name: ctx.locale('commands:shop.dataRolls_fields.fields.name'),
              value: ctx.locale('commands:shop.dataRolls_fields.fields.value', {
                price: valorRoll,
              }),
              inline: false,
            },
          ],
        };

        await embedMessage.edit({ content: ctx.message.author.toString(), embeds: [dataRolls] });

        const filterColetor = (msg: Message) => msg.author.id === ctx.message.author.id;
        const quantidadeCollector = ctx.message.channel.createMessageCollector({
          filter: filterColetor,
          max: 1,
          time: 30000,
        });

        quantidadeCollector.on('collect', (msg) => {
          const input = msg.content;
          if (!input) {
            ctx.replyT('error', 'commands:shop.dataRolls_fields.buy_rolls.invalid-number');
            return;
          }
          const valor = parseInt(input.replace(/\D+/g, ''));
          if (Number.isNaN(valor) || valor < 1) {
            embedMessage.delete().catch();
            ctx.replyT('error', 'commands:shop.dataRolls_fields.buy_rolls.invalid-number');
          } else {
            if (valor * valorRoll > ctx.data.user.estrelinhas) {
              ctx.replyT('error', 'commands:shop.dataRolls_fields.buy_rolls.poor');
              return;
            }

            const valueToPay = valor * valorRoll;

            repo.update(ctx.message.author.id, {
              $inc: { rolls: valor, estrelinhas: -valueToPay },
            });

            ctx.replyT('success', 'commands:shop.dataRolls_fields.buy_rolls.success', {
              quantity: valor,
              value: valueToPay,
              rolls: ctx.data.user.rolls + valor,
              stars: ctx.data.user.estrelinhas - valueToPay,
            });
          }
        });
      }
    });
  }

  static async lojaVender(
    ctx: CommandContext,
    embedMessage: Message,
    repo: UserRepository,
  ): Promise<Message | void> {
    const saldoAtual = ctx.data.user.estrelinhas;

    const demons = ctx.data.user.caçados || 0;
    const anjos = ctx.data.user.anjos || 0;
    const sd = ctx.data.user.semideuses || 0;
    const deuses = ctx.data.user.deuses || 0;

    const valorDemonio = shopEconomy.hunts.demon;
    const valorAnjo = shopEconomy.hunts.angel;
    const valorSD = shopEconomy.hunts.demigod;
    const valorDeus = shopEconomy.hunts.god;

    const dataVender = {
      title: ctx.locale('commands:shop.embed_title'),
      color: '#e77fa1' as ColorResolvable,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: ctx.locale('commands:shop.dataVender.main.description', {
        saldo: saldoAtual,
        demons,
        anjos,
        sd,
        deuses,
      }),
      footer: {
        text: ctx.locale('commands:shop.dataVender.main.footer'),
      },
      fields: [
        {
          name: ctx.locale('commands:shop.dataVender.main.fields.name'),
          value: ctx.locale('commands:shop.dataVender.main.fields.value', {
            demon: valorDemonio,
            angel: valorAnjo,
            demi: valorSD,
            god: valorDeus,
          }),
          inline: false,
        },
      ],
    };

    embedMessage.edit({ content: ctx.message.author.toString(), embeds: [dataVender] }).catch();

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector({ filter, max: 1, time: 30000 });

    collector.on('collect', (m) => {
      const cArgs = m.content.split(/ +/g);
      const input = cArgs[1] || '1';
      if (!input) {
        ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
        return;
      }
      const valor = parseInt(input.replace(/\D+/g, ''));

      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
        return;
      }

      switch (cArgs[0]) {
        case '1':
          if (valor > ctx.data.user.caçados) {
            ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'demônios' });
            return;
          }
          repo.update(ctx.message.author.id, {
            $inc: { caçados: -valor, estrelinhas: valor * valorDemonio },
          });
          ctx.replyT('success', 'commands:shop.dataVender.success-demon', {
            value: valor,
            cost: valor * valorDemonio,
            quantity: ctx.data.user.caçados - valor,
            star: ctx.data.user.estrelinhas + valor * valorDemonio,
          });
          break;
        case '2':
          if (valor > ctx.data.user.anjos) {
            ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'anjos' });
            return;
          }
          repo.update(ctx.message.author.id, {
            $inc: { anjos: -valor, estrelinhas: valor * valorAnjo },
          });
          ctx.replyT('success', 'commands:shop.dataVender.success-angel', {
            value: valor,
            cost: valor * valorAnjo,
            quantity: ctx.data.user.anjos - valor,
            star: ctx.data.user.estrelinhas + valor * valorAnjo,
          });
          break;
        case '3':
          if (valor > ctx.data.user.semideuses) {
            ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'semideuses' });
            return;
          }
          repo.update(ctx.message.author.id, {
            $inc: { semideuses: -valor, estrelinhas: valor * valorSD },
          });
          ctx.replyT('success', 'commands:shop.dataVender.success-sd', {
            value: valor,
            cost: valor * valorSD,
            quantity: ctx.data.user.semideuses - valor,
            star: ctx.data.user.estrelinhas + valor * valorSD,
          });
          break;
        case '4':
          if (valor > ctx.data.user.deuses) {
            ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'deuses' });
            return;
          }
          repo.update(ctx.message.author.id, {
            $inc: { deuses: -valor, estrelinhas: valor * valorDeus },
          });
          ctx.replyT('success', 'commands:shop.dataVender.success-god', {
            value: valor,
            cost: valor * valorDeus,
            quantity: ctx.data.user.deuses - valor,
            star: ctx.data.user.estrelinhas + valor * valorDeus,
          });
          break;
        default:
          embedMessage.delete().catch();
          ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
      }
    });
  }

  async run(ctx: CommandContext): Promise<void> {
    const saldoAtual = ctx.data.user.estrelinhas;

    const validArgs = ['1', '2'];

    const dataLoja = {
      title: ctx.locale('commands:shop.embed_title'),
      color: '#559bf7' as ColorResolvable,
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: ctx.locale('commands:shop.embed_description_saldo', { value: saldoAtual }),
      footer: {
        text: ctx.locale('commands:shop.embed_footer'),
      },
      fields: [
        {
          name: ctx.locale('commands:shop.dataLoja_fields.name'),
          value: ctx.locale('commands:shop.dataLoja_fields.value'),
          inline: false,
        },
      ],
    };
    const embedMessage = await ctx.sendC(ctx.message.author.toString(), {
      embeds: [dataLoja],
    });

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector({ filter, max: 1, time: 30000 });

    collector.on('collect', (m) => {
      if (!validArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) {
        ctx.replyT('error', 'commands:shop.invalid-option');
        return;
      }

      if (m.content === '1') {
        ShopCommand.lojaComprar(ctx, embedMessage, this.client.repositories.userRepository);
      } else ShopCommand.lojaVender(ctx, embedMessage, this.client.repositories.userRepository);
    });
  }
}
