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

  async run({ message, authorData }, t) {
    const saldoAtual = authorData.estrelinhas;

    const validArgs = ['1', '2'];

    const dataLoja = {
      title: t('commands:shop.embed_title'),
      color: '#559bf7',
      thumbnail: {
        url: 'https://i.imgur.com/t94XkgG.png',
      },
      description: t('commands:shop.embed_description_saldo', { value: saldoAtual }),
      footer: {
        text: t('commands:shop.embed_footer'),
      },
      fields: [{
        name: t('commands:shop.dataLoja_fields.name'),
        value: t('commands:shop.dataLoja_fields.value'),
        inline: false,
      }],
    };
    const embedMessage = await message.channel.send(message.author, { embed: dataLoja });

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (!validArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) return message.menheraReply('error', t('commands:shop.invalid-option'));

      if (m.content === '1') {
        // eslint-disable-next-line no-use-before-define
        lojaComprar(message, embedMessage, authorData, saldoAtual, t);
      // eslint-disable-next-line no-use-before-define
      } else lojaVender(message, embedMessage, authorData, saldoAtual, t);
    });
  }
};

function lojaComprar(message, embedMessage, user, saldoAtual, t) {
  const dataComprar = {
    title: t('commands:shop.embed_title'),
    color: '#6cbe50',
    thumbnail: {
      url: 'https://i.imgur.com/t94XkgG.png',
    },
    description: t('commands:shop.embed_description_saldo', { value: saldoAtual }),
    footer: {
      text: t('commands:shop.embed_footer'),
    },
    fields: [{
      name: t('commands:shop.dataComprar_fields.name'),
      value: t('commands:shop.dataComprar_fields.value'),
      inline: false,
    }],
  };
  embedMessage.edit(message.author, { embed: dataComprar }).catch();

  const validBuyArgs = ['1', '2'];

  const filter = (m) => m.author.id === message.author.id;
  const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

  collector.on('collect', (m) => {
    if (!validBuyArgs.some((answer) => answer.toLowerCase() === m.content.toLowerCase())) return message.menheraReply('error', t('commands:shop.invalid-option'));

    if (m.content === '1') {
      // abre loja de cores

      const coresDisponíveis = [{
        cor: '#6308c0',
        preço: 50000,
        nome: `**${t('commands:shop.colors.purple')}**`,
      }, {
        cor: '#df0509',
        preço: 50000,
        nome: `**${t('commands:shop.colors.red')}**`,
      }, {
        cor: '#55e0f7',
        preço: 50000,
        nome: `**${t('commands:shop.colors.cian')}**`,
      },
      {
        cor: '#03fd1c',
        preço: 50000,
        nome: `**${t('commands:shop.colors.green')}**`,
      }, {
        cor: '#fd03c9',
        preço: 50000,
        nome: `**${t('commands:shop.colors.pink')}**`,
      }, {
        cor: '#e2ff08',
        preço: 50000,
        nome: `**${t('commands:shop.colors.yellow')}**`,
      }, {
        cor: 'SUA ESCOLHA',
        preço: 100000,
        nome: `**${t('commands:shop.colors.your_choice')}**`,
      },
      ];

      const dataCores = {
        title: t('commands:shop.dataCores_fields.title'),
        color: '#6cbe50',
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        description: t('commands:shop.embed_description_saldo', { value: saldoAtual }),
        footer: {
          text: t('commands:shop.embed_footer'),
        },
        fields: [{
          name: t('commands:shop.dataCores_fields.field_name'),
          value: coresDisponíveis.map((c) => `${c.nome} | ${t('commands:shop.dataCores_fields.color_code')} \`${c.cor}\` | ${t('commands:shop.dataCores_fields.price')} **${c.preço}**⭐`).join('\n'),
          inline: false,
        }],
      };
      embedMessage.edit({ embed: dataCores });

      const validCorArgs = ['1', '2', '3', '4', '5', '6', '7'];

      const filtroCor = (msg) => msg.author.id === message.author.id;
      const CorColetor = message.channel.createMessageCollector(filtroCor, { max: 1, time: 30000, errors: ['time'] });

      CorColetor.on('collect', (msg) => {
        if (!validCorArgs.some((answer) => answer.toLowerCase() === msg.content.toLowerCase())) return message.menheraReply('error', t('commands:shop.invalid-option'));
        switch (msg.content) {
          case '1':
            if (user.cores.some((res) => res.cor === coresDisponíveis[0].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (user.estrelinhas < coresDisponíveis[0].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            user.estrelinhas -= coresDisponíveis[0].preço;
            user.cores.push(coresDisponíveis[0]);
            user.save();
            message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[0].nome, price: coresDisponíveis[0].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '2':
            if (user.cores.some((res) => res.cor === coresDisponíveis[1].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete().catch());
            if (user.estrelinhas < coresDisponíveis[1].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            user.estrelinhas -= coresDisponíveis[1].preço;
            user.cores.push(coresDisponíveis[1]);
            user.save();
            message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[1].nome, price: coresDisponíveis[1].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '3':
            if (user.cores.some((res) => res.cor === coresDisponíveis[2].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (user.estrelinhas < coresDisponíveis[2].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            user.estrelinhas -= coresDisponíveis[2].preço;
            user.cores.push(coresDisponíveis[2]);
            user.save();
            message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[2].nome, price: coresDisponíveis[2].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '4':
            if (user.cores.some((res) => res.cor === coresDisponíveis[3].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (user.estrelinhas < coresDisponíveis[3].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            user.estrelinhas -= coresDisponíveis[3].preço;
            user.cores.push(coresDisponíveis[3]);
            user.save();
            message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[3].nome, price: coresDisponíveis[3].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;
          case '5':
            if (user.cores.some((res) => res.cor === coresDisponíveis[4].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (user.estrelinhas < coresDisponíveis[4].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            user.estrelinhas -= coresDisponíveis[4].preço;
            user.cores.push(coresDisponíveis[4]);
            user.save();
            message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[4].nome, price: coresDisponíveis[4].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;

          case '6':
            if (user.cores.some((res) => res.cor === coresDisponíveis[5].cor)) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (user.estrelinhas < coresDisponíveis[5].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            user.estrelinhas -= coresDisponíveis[5].preço;
            user.cores.push(coresDisponíveis[5]);
            user.save();
            message.menheraReply('success', t('commands:shop.buy_colors.buy-success', { name: coresDisponíveis[5].nome, price: coresDisponíveis[5].preço, stars: user.estrelinhas })).then(() => embedMessage.delete({ timeout: 500 }).catch());
            break;

          case '7': {
            if (user.cores.some((res) => res.nome.startsWith('7'))) return message.menheraReply('yellow_circle', t('commands:shop.buy_colors.has-color')).then(() => embedMessage.delete({ timeout: 500 }).catch());
            if (user.estrelinhas < coresDisponíveis[6].preço) return message.menheraReply('error', t('commands:shop.buy_colors.poor')).then(() => embedMessage.delete({ timeout: 500 }).catch());

            const hexFiltro = (hexMsg) => hexMsg.author.id === message.author.id;
            const hexColletor = message.channel.createMessageCollector(hexFiltro, { max: 1, time: 30000, errors: ['time'] });

            message.channel.send(t('commands:shop.buy_colors.yc-message'));

            hexColletor.on('collect', (hexMsg) => {
              const isHexColor = (hex) => typeof hex === 'string' && hex.length === 6 && !Number.isNaN(Number(`0x${hex}`));
              if (isHexColor(hexMsg.content)) {
                user.estrelinhas -= coresDisponíveis[6].preço;
                user.cores.push({
                  nome: '7 - Sua Escolha',
                  cor: `#${m.content}`,
                  preço: 1000000,
                });
                user.save();
                message.menheraReply('sucess', t('commands:shop.buy_colors.yc-confirm', { color: m.content, price: coresDisponíveis[6].preço, stars: user.estrelinhas })).then(() => embedMessage.delete().catch);
              } else {
                return message.menheraReply('error', t('commands:shop.buy_colors.invalid-color')).then(() => embedMessage.delete().catch());
              }
            });
          }
        }
      });
    } else {
      // abre loja de rolls

      const valorRoll = 8500;
      const rollsAtual = user.rolls;

      const dataRolls = {
        title: t('commands:shop.dataRolls_fields.title'),
        color: '#b66642',
        thumbnail: {
          url: 'https://i.imgur.com/t94XkgG.png',
        },
        description: t('commands:shop.dataRolls_fields.description', { saldo: saldoAtual, rolls: rollsAtual }),
        footer: {
          text: t('commands:shop.dataRolls_fields.footer'),
        },
        fields: [{
          name: t('commands:shop.dataRolls_fields.fields.name'),
          value: t('commands:shop.dataRolls_fields.fields.value', { price: valorRoll }),
          inline: false,
        }],
      };

      embedMessage.edit(message.author, { embed: dataRolls });

      const filterColetor = (msg) => msg.author.id === message.author.id;
      const quantidadeCollector = message.channel.createMessageCollector(filterColetor, { max: 1, time: 30000, errors: ['time'] });

      quantidadeCollector.on('collect', (msg) => {
        const input = msg.content;
        if (!input) return message.menheraReply('error', t('commands:shop.dataRolls_fields.buy_rolls.invalid-number'));
        const valor = parseInt(input.replace(/\D+/g, ''));
        if (Number.isNaN(valor) || valor < 1) {
          embedMessage.delete({ timeout: 500 }).catch();
          message.menheraReply('error', t('commands:shop.dataRolls_fields.buy_rolls.invalid-number'));
        } else {
          if ((valor * valorRoll) > user.estrelinhas) return message.menheraReply('error', t('commands:shop.dataRolls_fields.buy_rolls.poor'));

          user.estrelinhas -= (valor * valorRoll);
          user.rolls += valor;
          user.save();

          const valval = valor * valorRoll; // valor para a traduçãp

          message.menheraReply('success', t('commands:shop.dataRolls_fields.buy_rolls.success', {
            quantity: valor, value: valval, rolls: user.rolls, stars: user.estrelinhas,
          }));
        }
      });
    }
  });
}

function lojaVender(message, embedMessage, user, saldoAtual, t) {
  const demons = user.caçados || 0;
  const anjos = user.anjos || 0;
  const sd = user.semideuses || 0;
  const deuses = user.deuses || 0;

  const dataVender = {
    title: t('commands:shop.embed_title'),
    color: '#e77fa1',
    thumbnail: {
      url: 'https://i.imgur.com/t94XkgG.png',
    },
    description: t('commands:shop.dataVender.main.description', {
      saldo: saldoAtual, demons, anjos, sd, deuses,
    }),
    footer: {
      text: t('commands:shop.dataVender.main.footer'),
    },
    fields: [{
      name: t('commands:shop.dataVender.main.fields.name'),
      value: t('commands:shop.dataVender.main.fields.value'),
      inline: false,
    }],
  };

  embedMessage.edit(message.author, { embed: dataVender }).catch();

  const filter = (m) => m.author.id === message.author.id;
  const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

  collector.on('collect', (m) => {
    const cArgs = m.content.split(/ +/g);
    const input = cArgs[1];
    if (!input) return message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
    const valor = parseInt(input.replace(/\D+/g, ''));

    const valorDemonio = 700;
    const valorAnjo = 3500;
    const valorSD = 10000;
    const valorDeus = 50000;

    if (cArgs[0] === '1') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        return message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
      }
      if (valor > user.caçados) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'demônios' }));
      user.caçados -= valor;
      user.estrelinhas += (valor * valorDemonio);
      user.save();
      message.menheraReply('success', t('commands:shop.dataVender.success-demon', {
        value: valor, cost: valor * valorDemonio, quantity: user.caçados, star: user.estrelinhas,
      }));
    } else if (cArgs[0] === '2') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
      } else {
        if (valor > user.anjos) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'anjos' }));
        user.anjos -= valor;
        user.estrelinhas += (valor * valorAnjo);
        user.save();
        message.menheraReply('success', t('commands:shop.dataVender.success-angel', {
          value: valor, cost: valor * valorAnjo, quantity: user.anjos, star: user.estrelinhas,
        }));
      }
    } else if (cArgs[0] === '3') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
      } else {
        if (valor > user.semideuses) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'semideuses' }));
        user.semideuses -= valor;
        user.estrelinhas += (valor * valorSD);
        user.save();
        message.menheraReply('success', t('commands:shop.dataVender.success-sd', {
          value: valor, cost: valor * valorSD, quantity: user.semideuses, star: user.estrelinhas,
        }));
      }
    } else if (cArgs[0] === '4') {
      if (Number.isNaN(valor) || valor < 1) {
        embedMessage.delete().catch();
        message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
      } else {
        if (valor > user.deuses) return message.menheraReply('error', t('commands:shop.dataVender.poor', { var: 'deuses' }));
        user.deuses -= valor;
        user.estrelinhas += (valor * valorDeus);
        user.save();
        message.menheraReply('success', t('commands:shop.dataVender.success-god', {
          value: valor, cost: valor * valorDeus, quantity: user.deuses, star: user.estrelinhas,
        }));
      }
    } else {
      embedMessage.delete().catch();
      message.menheraReply('error', t('commands:shop.dataVender.invalid-args'));
    }
  });
}
