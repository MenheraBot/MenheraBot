const Command = require('../../structures/command');

module.exports = class ShopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shop',
      aliases: ['loja'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'economia',
    });
  }

  async run(ctx) {
    const authorData = ctx.data.user;

    const saldoAtual = authorData.estrelinhas;

    const validArgs = ['1', '2'];

    const dataLoja = {
      title: ctx.locale('commands:shop.embed_title'),
      color: '#559bf7',
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: ctx.locale('commands:shop.embed_description_saldo', { value: saldoAtual }),
      footer: {
        text: ctx.locale('commands:shop.embed_footer'),
      },
      fields: [{
        name: ctx.locale('commands:shop.dataLoja_fields.name'),
        value: ctx.locale('commands:shop.dataLoja_fields.value'),
        inline: false,
      }],
    };
    const embedMessage = await ctx.sendC(ctx.message.author, { embed: dataLoja });

    const filter = (m) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (!validArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) return ctx.replyT('error', 'commands:shop.invalid-option');

      if (m.content === '1') {
        // eslint-disable-next-line no-use-before-define
        lojaComprar(ctx, embedMessage, this.client.constants);
        // eslint-disable-next-line no-use-before-define
      } else lojaVender(ctx, embedMessage, this.client.constants);
    });
  }
};

function lojaComprar(ctx, embedMessage, constants) {
  const saldoAtual = ctx.data.user.estrelinhas;
  const dataComprar = {
    title: ctx.locale('commands:shop.embed_title'),
    color: '#6cbe50',
    thumbnail: {
      url: 'https://i.imgur.com/t94XkgG.png',
    },
    description: ctx.locale('commands:shop.embed_description_saldo', { value: saldoAtual }),
    footer: {
      text: ctx.locale('commands:shop.embed_footer'),
    },
    fields: [{
      name: ctx.locale('commands:shop.dataComprar_fields.name'),
      value: ctx.locale('commands:shop.dataComprar_fields.value'),
      inline: false,
    }],
  };
  embedMessage.edit(ctx.message.author, { embed: dataComprar }).catch();

  const validBuyArgs = ['1', '2'];

  const filter = (m) => m.author.id === ctx.message.author.id;
  const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

  collector.on('collect', (m) => {
    if (!validBuyArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) return ctx.replyT('error', 'commands:shop.invalid-option');

    if (m.content === '1') {
      // abre loja de cores

      const coresDisponíveis = [{
        cor: '#6308c0',
        preço: constants.shopEconomy.colors.purple,
        nome: `**${ctx.locale('commands:shop.colors.purple')}**`,
      }, {
        cor: '#df0509',
        preço: constants.shopEconomy.colors.red,
        nome: `**${ctx.locale('commands:shop.colors.red')}**`,
      }, {
        cor: '#55e0f7',
        preço: constants.shopEconomy.colors.cian,
        nome: `**${ctx.locale('commands:shop.colors.cian')}**`,
      },
      {
        cor: '#03fd1c',
        preço: constants.shopEconomy.colors.green,
        nome: `**${ctx.locale('commands:shop.colors.green')}**`,
      }, {
        cor: '#fd03c9',
        preço: constants.shopEconomy.colors.pink,
        nome: `**${ctx.locale('commands:shop.colors.pink')}**`,
      }, {
        cor: '#e2ff08',
        preço: constants.shopEconomy.colors.yellow,
        nome: `**${ctx.locale('commands:shop.colors.yellow')}**`,
      }, {
        cor: 'SUA ESCOLHA',
        preço: constants.shopEconomy.colors.your_choice,
        nome: `**${ctx.locale('commands:shop.colors.your_choice')}**`,
      },
      ];

      const dataCores = {
        title: ctx.locale('commands:shop.dataCores_fields.title'),
        color: '#6cbe50',
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        description: ctx.locale('commands:shop.embed_description_saldo', { value: saldoAtual }),
        footer: {
          text: ctx.locale('commands:shop.embed_footer'),
        },
        fields: [{
          name: ctx.locale('commands:shop.dataCores_fields.field_name'),
          value: coresDisponíveis.map((c) => `${c.nome} | ${ctx.locale('commands:shop.dataCores_fields.color_code')} \`${c.cor}\` | ${ctx.locale('commands:shop.dataCores_fields.price')} **${c.preço}**⭐`).join('\n'),
          inline: false,
        }],
      };
      embedMessage.edit({ embed: dataCores });

      const validCorArgs = ['1', '2', '3', '4', '5', '6', '7'];

      const filtroCor = (msg) => msg.author.id === ctx.message.author.id;
      const CorColetor = ctx.message.channel.createMessageCollector(filtroCor, { max: 1, time: 30000, errors: ['time'] });

      CorColetor.on('collect', (msg) => {
        if (!validCorArgs.some((answer) => answer.toLowerCase() === msg.content.toLowerCase())) return ctx.replyT('error', 'commands:shop.invalid-option');
        switch (msg.content) {
          case '1':
            if (ctx.data.user.cores.some((res) => res.cor === coresDisponíveis[0].cor)) return ctx.replyT('yellow_circle', 'commands:shop.buy_colors.has-color').then(() => embedMessage.delete().catch());
            if (ctx.data.user.estrelinhas < coresDisponíveis[0].preço) return ctx.replyT('error', 'commands:shop.buy_colors.poor').then(() => embedMessage.delete().catch());
            ctx.data.user.estrelinhas -= coresDisponíveis[0].preço;
            ctx.data.user.cores.push(coresDisponíveis[0]);
            ctx.data.user.save();
            ctx.replyT('success', 'commands:shop.buy_colors.buy-success', { name: coresDisponíveis[0].nome, price: coresDisponíveis[0].preço, stars: ctx.data.user.estrelinhas }).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '2':
            if (ctx.data.user.cores.some((res) => res.cor === coresDisponíveis[1].cor)) return ctx.replyT('yellow_circle', 'commands:shop.buy_colors.has-color').then(() => embedMessage.delete().catch());
            if (ctx.data.user.estrelinhas < coresDisponíveis[1].preço) return ctx.replyT('error', 'commands:shop.buy_colors.poor').then(() => embedMessage.delete({ timeout: 500 }).catch());
            ctx.data.user.estrelinhas -= coresDisponíveis[1].preço;
            ctx.data.user.cores.push(coresDisponíveis[1]);
            ctx.data.user.save();
            ctx.replyT('success', 'commands:shop.buy_colors.buy-success', { name: coresDisponíveis[1].nome, price: coresDisponíveis[1].preço, stars: ctx.data.user.estrelinhas }).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '3':
            if (ctx.data.user.cores.some((res) => res.cor === coresDisponíveis[2].cor)) return ctx.replyT('yellow_circle', 'commands:shop.buy_colors.has-color').then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (ctx.data.user.estrelinhas < coresDisponíveis[2].preço) return ctx.replyT('error', 'commands:shop.buy_colors.poor').then(() => embedMessage.delete({ timeout: 500 }).catch());
            ctx.data.user.estrelinhas -= coresDisponíveis[2].preço;
            ctx.data.user.cores.push(coresDisponíveis[2]);
            ctx.data.user.save();
            ctx.replyT('success', 'commands:shop.buy_colors.buy-success', { name: coresDisponíveis[2].nome, price: coresDisponíveis[2].preço, stars: ctx.data.user.estrelinhas }).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '4':
            if (ctx.data.user.cores.some((res) => res.cor === coresDisponíveis[3].cor)) return ctx.replyT('yellow_circle', 'commands:shop.buy_colors.has-color').then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (ctx.data.user.estrelinhas < coresDisponíveis[3].preço) return ctx.replyT('error', 'commands:shop.buy_colors.poor').then(() => embedMessage.delete({ timeout: 500 }).catch());
            ctx.data.user.estrelinhas -= coresDisponíveis[3].preço;
            ctx.data.user.cores.push(coresDisponíveis[3]);
            ctx.data.user.save();
            ctx.replyT('success', 'commands:shop.buy_colors.buy-success', { name: coresDisponíveis[3].nome, price: coresDisponíveis[3].preço, stars: ctx.data.user.estrelinhas }).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '5':
            if (ctx.data.user.cores.some((res) => res.cor === coresDisponíveis[4].cor)) return ctx.reply('yellow_circle', 'commands:shop.buy_colors.has-color').then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (ctx.data.user.estrelinhas < coresDisponíveis[4].preço) return ctx.replyT('error', 'commands:shop.buy_colors.poor').then(() => embedMessage.delete({ timeout: 500 }).catch());
            ctx.data.user.estrelinhas -= coresDisponíveis[4].preço;
            ctx.data.user.cores.push(coresDisponíveis[4]);
            ctx.data.user.save();
            ctx.replyT('success', 'commands:shop.buy_colors.buy-success', { name: coresDisponíveis[4].nome, price: coresDisponíveis[4].preço, stars: ctx.data.user.estrelinhas }).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;

          case '6':
            if (ctx.data.user.cores.some((res) => res.cor === coresDisponíveis[5].cor)) return ctx.replyT('yellow_circle', 'commands:shop.buy_colors.has-color').then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (ctx.data.user.estrelinhas < coresDisponíveis[5].preço) return ctx.replyT('error', 'commands:shop.buy_colors.poor').then(() => embedMessage.delete({ timeout: 500 }).catch());
            ctx.data.user.estrelinhas -= coresDisponíveis[5].preço;
            ctx.data.user.cores.push(coresDisponíveis[5]);
            ctx.data.user.save();
            ctx.replyT('success', 'commands:shop.buy_colors.buy-success', { name: coresDisponíveis[5].nome, price: coresDisponíveis[5].preço, stars: ctx.data.user.estrelinhas }).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;

          case '7': {
            if (ctx.data.user.cores.some((res) => res.nome.startsWith('7'))) return ctx.replyT('yellow_circle', 'commands:shop.buy_colors.has-color').then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (ctx.data.user.estrelinhas < coresDisponíveis[6].preço) return ctx.replyT('error', 'commands:shop.buy_colors.poor').then(() => embedMessage.delete({ timeout: 500 }).catch());

            const hexFiltro = (hexMsg) => hexMsg.author.id === ctx.message.author.id;
            const hexColletor = ctx.message.channel.createMessageCollector(hexFiltro, { max: 1, time: 30000, errors: ['time'] });

            ctx.send(ctx.locale('commands:shop.buy_colors.yc-message'));

            hexColletor.on('collect', (hexMsg) => {
              const isHexColor = (hex) => typeof hex === 'string' && hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));
              if (isHexColor(hexMsg.content)) {
                ctx.data.user.estrelinhas -= coresDisponíveis[6].preço;
                ctx.data.user.cores.push({
                  nome: '7 - Sua Escolha',
                  cor: `#${hexMsg.content}`,
                  preço: constants.shopEconomy.colors.your_choice,
                });
                ctx.data.user.save();
                ctx.replyT('sucess', 'commands:shop.buy_colors.yc-confirm', { color: hexMsg.content, price: coresDisponíveis[6].preço, stars: ctx.data.user.estrelinhas }).then(() => embedMessage.delete().catch);
              } else {
                return ctx.replyT('error', 'commands:shop.buy_colors.invalid-color').then(() => embedMessage.delete().catch());
              }
            });
          }
        }
      });
    } else {
      // abre loja de rolls

      const valorRoll = constants.shopEconomy.hunts.roll;
      const rollsAtual = ctx.data.user.rolls;

      const dataRolls = {
        title: ctx.locale('commands:shop.dataRolls_fields.title'),
        color: '#b66642',
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        description: ctx.locale('commands:shop.dataRolls_fields.description', { saldo: saldoAtual, rolls: rollsAtual }),
        footer: {
          text: ctx.locale('commands:shop.dataRolls_fields.footer'),
        },
        fields: [{
          name: ctx.localet('commands:shop.dataRolls_fields.fields.name'),
          value: ctx.locale('commands:shop.dataRolls_fields.fields.value', { price: valorRoll }),
          inline: false,
        }],
      };

      embedMessage.edit(ctx.message.author, { embed: dataRolls });

      const filterColetor = (msg) => msg.author.id === ctx.message.author.id;
      const quantidadeCollector = ctx.message.channel.createMessageCollector(filterColetor, { max: 1, time: 30000, errors: ['time'] });

      quantidadeCollector.on('collect', (msg) => {
        const input = msg.content;
        if (!input) return ctx.replyT('error', 'commands:shop.dataRolls_fields.buy_rolls.invalid-number');
        const valor = parseInt(input.replace(/\D+/g, ''));
        if (Number.isNaN(valor) || valor < 1) {
          embedMessage.delete({ timeout: 500 }).catch();
          ctx.replyT('error', 'commands:shop.dataRolls_fields.buy_rolls.invalid-number');
        } else {
          if ((valor * valorRoll) > ctx.data.user.estrelinhas) return ctx.replyt('error', 'commands:shop.dataRolls_fields.buy_rolls.poor');

          ctx.data.user.estrelinhas -= (valor * valorRoll);
          ctx.data.user.rolls += valor;
          ctx.data.user.save();

          const valval = valor * valorRoll; // valor para a traduçãp

          ctx.replyT('success', 'commands:shop.dataRolls_fields.buy_rolls.success', {
            quantity: valor, value: valval, rolls: ctx.data.user.rolls, stars: ctx.data.user.estrelinhas,
          });
        }
      });
    }
  });
}

function lojaVender(ctx, embedMessage, constants) {
  const saldoAtual = ctx.data.user.estrelinhas;

  const demons = ctx.data.user.caçados || 0;
  const anjos = ctx.data.user.anjos || 0;
  const sd = ctx.data.user.semideuses || 0;
  const deuses = ctx.data.user.deuses || 0;

  const valorDemonio = constants.shopEconomy.hunts.demon;
  const valorAnjo = constants.shopEconomy.hunts.angel;
  const valorSD = constants.shopEconomy.hunts.demigod;
  const valorDeus = constants.shopEconomy.hunts.god;

  const dataVender = {
    title: ctx.locale('commands:shop.embed_title'),
    color: '#e77fa1',
    thumbnail: {
      url: 'https://i.imgur.com/t94XkgG.png',
    },
    description: ctx.locale('commands:shop.dataVender.main.description', {
      saldo: saldoAtual, demons, anjos, sd, deuses,
    }),
    footer: {
      text: ctx.locale('commands:shop.dataVender.main.footer'),
    },
    fields: [{
      name: ctx.localet('commands:shop.dataVender.main.fields.name'),
      value: ctx.locale('commands:shop.dataVender.main.fields.value', {
        demon: valorDemonio, angel: valorAnjo, demi: valorSD, god: valorDeus,
      }),
      inline: false,
    }],
  };

  embedMessage.edit(ctx.message.author, { embed: dataVender }).catch();

  const filter = (m) => m.author.id === ctx.message.author.id;
  const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

  collector.on('collect', (m) => {
    const cArgs = m.content.split(/ +/g);
    const input = cArgs[1];
    if (!input) return ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
    const valor = parseInt(input.replace(/\D+/g, ''));

    if (cArgs[0] === '1') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        return ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
      }
      if (valor > ctx.data.user.caçados) return ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'demônios' });
      ctx.data.user.caçados -= valor;
      ctx.data.user.estrelinhas += (valor * valorDemonio);
      ctx.data.user.save();
      ctx.replyT('success', 'commands:shop.dataVender.success-demon', {
        value: valor, cost: valor * valorDemonio, quantity: ctx.data.user.caçados, star: ctx.data.user.estrelinhas,
      });
    } else if (cArgs[0] === '2') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
      } else {
        if (valor > ctx.data.user.anjos) return ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'anjos' });
        ctx.data.user.anjos -= valor;
        ctx.data.user.estrelinhas += (valor * valorAnjo);
        ctx.data.user.save();
        ctx.replyT('success', 'commands:shop.dataVender.success-angel', {
          value: valor, cost: valor * valorAnjo, quantity: ctx.data.user.anjos, star: ctx.data.user.estrelinhas,
        });
      }
    } else if (cArgs[0] === '3') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
      } else {
        if (valor > ctx.data.user.semideuses) return ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'semideuses' });
        ctx.data.user.semideuses -= valor;
        ctx.data.user.estrelinhas += (valor * valorSD);
        ctx.data.user.save();
        ctx.replyT('success', 'commands:shop.dataVender.success-sd', {
          value: valor, cost: valor * valorSD, quantity: ctx.data.user.semideuses, star: ctx.data.user.estrelinhas,
        });
      }
    } else if (cArgs[0] === '4') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
      } else {
        if (valor > ctx.data.user.deuses) return ctx.replyT('error', 'commands:shop.dataVender.poor', { var: 'deuses' });
        ctx.data.user.deuses -= valor;
        ctx.data.user.estrelinhas += (valor * valorDeus);
        ctx.data.user.save();
        ctx.replyT('success', 'commands:shop.dataVender.success-god', {
          value: valor, cost: valor * valorDeus, quantity: ctx.data.user.deuses, star: ctx.data.user.estrelinhas,
        });
      }
    } else {
      embedMessage.delete().catch();
      ctx.replyT('error', 'commands:shop.dataVender.invalid-args');
    }
  });
}
