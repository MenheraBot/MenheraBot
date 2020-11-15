const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const PagesCollector = require('../../utils/Pages');
const itemsFile = require('../../structures/RpgHandler').items;

module.exports = class VillageCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'village',
      aliases: ['vila'],
      cooldown: 5,
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) {
      return message.menheraReply('error', t('commands:village.non-aventure'));
    }

    const embed = new MessageEmbed()
      .setColor('#bbfd7c')
      .setTitle(t('commands:village.index.title'))
      .setDescription(t('commands:village.index.description'))
      .addField(t('commands:village.index.field_name'), t('commands:village.index.field_value'))
      .setFooter(t('commands:village.index.footer'));

    const sent = await message.channel.send(message.author, embed);

    const options = [
      {
        title: 'bruxa',
        exec: (_, _o, collector) => VillageCommand.bruxa(message, user, t, collector),
      },
      {
        title: 'ferreiro',
        exec: (_, _o, collector) => VillageCommand.ferreiro(message, user, t, collector),
      },
      {
        title: 'hotel',
        exec: (_, _o, collector) => VillageCommand.hotel(message, user, t, collector),
      },
      {
        title: 'guilda',
        exec: (_, _o, collector) => VillageCommand.guilda(message, user, t, collector),
      },
    ];

    const invalidOption = (_, collector) => collector.menheraReply(t('commands:village.invalid-option'));

    const collector = new PagesCollector(
      message.channel,
      {
        sent, message, t, options, invalidOption,
      },
      { max: 1, time: 30000, errors: ['time'] },
    );

    collector.once('end', (v, r) => console.log('cabo', r));
  }

  static bruxa(message, user, t, collector) {
    const itens = itemsFile.bruxa.filter((item) => user.level >= item.minLevel && user.level < item.maxLevel);

    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${t('commands:village.bruxa.title')}`)
      .setColor('#c5b5a0')
      .setFooter(t('commands:village.bruxa.footer'))
      .setDescription(t('commands:village.bruxa.description', { money: user.money }));

    itens.forEach((item, i) => {
      embed.addField(
        `---------------[ ${i + 1} ]---------------\n${item.name}`,
        `📜 | **${t('commands:village.desc')}:** ${item.description}\n💎 |** ${t('commands:village.cost')}:** ${item.value}`,
      );
    });

    collector.send(message.author, embed);

    const exec = (msg, { data: item }) => {
      const quantity = parseInt(msg.content.trim().split(/ +/g)[1]) || 1;

      if (Number.isNaN(quantity) || quantity < 1) {
        collector.menheraReply('error', t('commands:village.invalid-quantity'), { embed: {} });
        return PagesCollector.fail();
      }

      const value = item.value * quantity;

      if (!value) {
        collector.menheraReply('error', t('commands:village.invalid-value'));
        return PagesCollector.fail();
      }

      if (user.money < value) {
        return collector.menheraReply('error', t('commands:village.poor'));
      }

      if ((user?.backpack.value + quantity) > user?.backpack.capacity) {
        return collector.menheraReply('error', 'commands:village.backpack-full');
      }

      collector.menheraReply('success', t('commands:village.bruxa.bought', { quantidade: quantity, name: item.name, valor: value }));

      for (let j = 0; j < quantity; j++) {
        user.inventory.push(item);
        if (user.backpack) {
          const newValue = user.backpack.value + 1;
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: newValue,
          };
        }
      }

      if (user.backpack.value < 0) {
        user.backpack = {
          name: user.backpack.name,
          capacity: user.backpack.capacity,
          value: 0,
        };
      }

      user.money -= value;
      return user.save();
    };

    return itens.map((c) => ({ data: c, title: c.name, exec }));
  }

  static ferreiro(message, user, t, collector) {
    if (user.level < 9) return message.menheraReply('error', t('commands:village.ferreiro.low-level'));

    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(t('commands:village.ferreiro.description'))
      .addField(t('commands:village.ferreiro.field_name'), t('commands:village.ferreiro.field_value'))
      .setFooter(t('commands:village.ferreiro.footer'));

    msg.edit(message.author, embed);

    const filter = (m) => m.author.id === message.author.id;
    // const collector = message.channel.createMessageCollector(filter, { max: 1 });

    collector.on('collect', (m) => {
      switch (m.content) {
        case '1':
          VillageCommand.ferreiroArma(message, user, msg, t);
          break;
        case '2':
          VillageCommand.ferreiroArmadura(message, user, msg, t);
          break;
        case '3':
          VillageCommand.ferreiroMochila(message, user, msg, t);
          break;
        default:
          return message.menheraReply('error', t('commands:village.invalid-option'));
      }
    });
  }

  static ferreiroArma(message, user, msg, t) {
    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(`<:atencao:759603958418767922> | ${t('commands:village.ferreiro.arma.description')}`)
      .addFields([{
        name: `1 - ${t('commands:village.ferreiro.arma.lança')}`,
        value: `🗡️ | ${t('commands:village.ferreiro.dmg')}: **17**\n💎 | ${t('commands:village.ferreiro.cost')}: **500**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **2 Presas de Lobisomem**`,
      },
      {
        name: `2 - ${t('commands:village.ferreiro.arma.espada')}`,
        value: `🗡️ | ${t('commands:village.ferreiro.dmg')}: **27**\n💎 | ${t('commands:village.ferreiro.cost')}: **950**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **2 Chifres de Minotauro**`,
      },
      {
        name: `3 - ${t('commands:village.ferreiro.arma.deuses')}`,
        value: `🗡️ | ${t('commands:village.ferreiro.dmg')}: **50**\n💎 | ${t('commands:village.ferreiro.cost')}: **50000**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **5 Espadas de Freya**`,
      },
      ])
      .setFooter(t('commands:village.ferreiro.arma.footer'));

    msg.edit(message.author, embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1 });

    const nameLoots = [];

    user.loots.forEach((loot) => {
      nameLoots.push(loot.name);
    });

    const contado = VillageCommand.countItems(nameLoots);

    const filtrado = contado.filter((f) => f.name === 'Presas de Lobisomem');
    const filtrado1 = contado.filter((f) => f.name === 'Chifre de Minotauro');
    const filtrado2 = contado.filter((f) => f.name === 'Espada de Freya');

    collector.on('collect', (m) => {
      if (m.content === '1') {
        if (user.money < 500) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtrado[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.arma.poor', { value: 2 })} Presas de Lobisomem`);
        if (filtrado[0].amount < 2) return message.menheraReply('error', `${t('commands:village.ferreiro.arma.poor', { value: 2 })} Presas de Lobisomem`);

        user.weapon = {
          name: 'Lança de Presas de Lobisomem',
          damage: 17,
        };
        user.money -= 500;
        for (let j = 0; j < 2; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtrado[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = { name: user.backpack.name, capacity: user.backpack.capacity, value: 0 };
        }
        user.save();
        message.menheraReply('success', t('commands:village.ferreiro.arma.change', { arma: 'Lança de Presas de Lobisomem' }));
      } else if (m.content === '2') {
        if (user.money < 950) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtrado1[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.arma.poor', { value: 2 })} Chifres de Minotauro`);
        if (filtrado1[0].amount < 2) return message.menheraReply('error', `${t('commands:village.ferreiro.arma.poor', { value: 2 })} Chifres de Minotauro`);

        user.weapon = {
          name: 'Espada de Chifre de Minotauro',
          damage: 27,
        };
        user.money -= 950;
        for (let j = 0; j < 2; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtrado1[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }

        user.save();
        message.menheraReply('success', t('commands:village.ferreiro.arma.change', { arma: 'Espada de Chifre de Minotauro' }));
      } else if (m.content === '3') {
        if (user.money < 50000) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtrado2[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.arma.poor', { value: 5 })} Espadas de Freya`);
        if (filtrado2[0].amount < 5) return message.menheraReply('error', `${t('commands:village.ferreiro.arma.poor', { value: 5 })} Espadas de Freya`);

        user.weapon = {
          name: 'Espada dos Deuses',
          damage: 50,
        };
        user.money -= 50000;
        for (let j = 0; j < 5; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtrado2[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }
        user.save();
        return message.menheraReply('success', t('commands:village.ferreiro.arma.change', { arma: 'Espada dos Deuses' }));
      } else return message.menheraReply('error', t('commands:village.invalid-option'));
    });
  }

  static ferreiroArmadura(message, user, msg, t) {
    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(`<:atencao:759603958418767922> | ${t('commands:village.ferreiro.armadura.description')}`)
      .addFields([{
        name: `1 - ${t('commands:village.ferreiro.armadura.reforçado')}`,
        value: `🛡️ | ${t('commands:village.ferreiro.prt')}: **10**\n💎 | ${t('commands:village.ferreiro.cost')}: **400**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **1 Pele de Lobisomem**`,
      },
      {
        name: `2 - ${t('commands:village.ferreiro.armadura.perfeito')}`,
        value: `🛡️ | ${t('commands:village.ferreiro.prt')}: **30**\n💎 | ${t('commands:village.ferreiro.cost')}: **1000**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **3 Pele de Lobisomem**`,
      },
      {
        name: `3 - ${t('commands:village.ferreiro.armadura.deuses')}`,
        value: `🛡️ | ${t('commands:village.ferreiro.prt')}: **50**\n💎 | ${t('commands:village.ferreiro.cost')}: **50000**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **5 Escudos de Ares**`,
      },
      ])
      .setFooter(t('commands:village.ferreiro.footer'));

    msg.edit(message.author, embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1 });

    const nameLoots = [];

    user.loots.forEach((loot) => {
      nameLoots.push(loot.name);
    });

    const contado = VillageCommand.countItems(nameLoots);

    const filtrado = contado.filter((f) => f.name === 'Pele de Lobisomem');
    const filtradoEscudo = contado.filter((f) => f.name === 'Escudo de Ares');

    collector.on('collect', (m) => {
      if (m.content === '1') {
        if (user.money < 400) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtrado[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.armadura.poor', { value: 1 })} Pele de Lobisomem`);
        if (filtrado[0].amount < 1) return message.menheraReply('error', `${t('commands:village.ferreiro.armadura.poor', { value: 1 })} Pele de Lobisomem`);

        user.protection = {
          name: 'Peitoral Reforçado',
          armor: 10,
        };
        user.money -= 400;
        for (let j = 0; j < 1; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtrado[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }
        user.save();
        return message.menheraReply('success', t('commands:village.ferreiro.armadura.change', { armadura: 'Peitoral Reforçado' }));
      } if (m.content === '2') {
        if (user.money < 1000) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtrado[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.armadura.poor', { value: 3 })} Peles de Lobisomem`);
        if (filtrado[0].amount < 3) return message.menheraReply('error', `${t('commands:village.ferreiro.armadura.poor', { value: 3 })} Peles de Lobisomem`);

        user.protection = {
          name: 'Peitoral Perfeito',
          armor: 30,
        };
        user.money -= 1000;
        for (let j = 0; j < 3; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtrado[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }
        user.save();
        return message.menheraReply('success', t('commands:village.ferreiro.armadura.change', { armadura: 'Peitoral Perfeito' }));
      } if (m.content === '3') {
        if (user.money < 50000) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtradoEscudo[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.armadura.poor', { value: 5 })} Escudo de Ares`);
        if (filtradoEscudo[0].amount < 5) return message.menheraReply('error', `${t('commands:village.ferreiro.armadura.poor', { value: 5 })} Escudo de Ares`);

        user.protection = {
          name: 'Peitoral dos Deuses',
          armor: 50,
        };
        user.money -= 50000;
        for (let j = 0; j < 5; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtradoEscudo[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }

        user.save();
        return message.menheraReply('success', t('commands:village.ferreiro.armadura.change', { armadura: 'Peitoral dos Deuses' }));
      } return message.menheraReply('error', t('commands:village.invalid-option'));
    });
  }

  static ferreiroMochila(message, user, msg, t) {
    const embed = new MessageEmbed()
      .setColor('#fcf7f7')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(`<:atencao:759603958418767922> | ${t('commands:village.ferreiro.mochila.description')}`)
      .addFields([{
        name: `1 - ${t('commands:village.ferreiro.mochila.cobra')}`,
        value: `🧺 | ${t('commands:village.ferreiro.cpt')}: **35**\n💎 | ${t('commands:village.ferreiro.cost')}: **2000**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **5 Pele de Cobra**`,
      },
      {
        name: `2 - ${t('commands:village.ferreiro.mochila.escama')}`,
        value: `🧺 | ${t('commands:village.ferreiro.cpt')}: **50**\n💎 | ${t('commands:village.ferreiro.cost')}: **50000**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **5 Escamas de Kraken**`,
      },
      {
        name: `3 - ${t('commands:village.ferreiro.mochila.rabadon')}`,
        value: `🧺 | ${t('commands:village.ferreiro.cpt')}: **100**\n💎 | ${t('commands:village.ferreiro.cost')}: **250000**\n<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: **5 Capuz da Morte de Rabadon**`,
      },
      ])
      .setFooter(t('commands:village.ferreiro.footer'));

    msg.edit(message.author, embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1 });

    const nameLoots = [];

    user.loots.forEach((loot) => {
      nameLoots.push(loot.name);
    });

    const contado = VillageCommand.countItems(nameLoots);

    const filtradoCobra = contado.filter((f) => f.name === 'Pele de cobra');
    const filtradoEscama = contado.filter((f) => f.name === 'Escama de Kraken');
    const filtradoRabadon = contado.filter((f) => f.name === 'Capuz da Morte de Rabadon');

    collector.on('collect', (m) => {
      if (m.content === '1') {
        if (user.money < 2000) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtradoCobra[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.mochila.poor', { value: 5 })} Pele de Cobra`);
        if (filtradoEscama[0].amount < 5) return message.menheraReply('error', `${t('commands:village.ferreiro.mochila.poor', { value: 5 })} Pele de Cobra`);

        user.backpack = {
          name: 'Mochila de Pele de Cobra',
          capacity: 35,
          value: user.backpack.value,
        };
        user.money -= 2000;
        for (let j = 0; j < 1; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtradoCobra[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }
        user.save();
        return message.menheraReply('success', t('commands:village.ferreiro.mochila.change', { mochila: 'Mochila de Pele de Cobra' }));
      } if (m.content === '2') {
        if (user.money < 50000) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtradoEscama[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.mochila.poor', { value: 5 })} Escamas de Kraken`);
        if (filtradoEscama[0].amount < 5) return message.menheraReply('error', `${t('commands:village.ferreiro.mochila.poor', { value: 5 })} Escamas de Kraken`);

        user.backpack = {
          name: 'Mochila de escamas de Kraken',
          capacity: 50,
          value: user.backpack.value,
        };
        user.money -= 50000;
        for (let j = 0; j < 3; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtradoEscama[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }
        user.save();
        return message.menheraReply('success', t('commands:village.ferreiro.mochila.change', { mochila: 'Mochila de escamas de Kraken' }));
      } if (m.content === '3') {
        if (user.money < 250000) return message.menheraReply('error', t('commands:village.poor'));
        if (!filtradoRabadon[0]) return message.menheraReply('error', `${t('commands:village.ferreiro.mochila.poor', { value: 5 })} Capuz da Morte de Rabadon`);
        if (filtradoRabadon[0].amount < 5) return message.menheraReply('error', `${t('commands:village.ferreiro.mochila.poor', { value: 5 })} Capuz da Morte de Rabadon`);

        user.protection = {
          name: 'Mochila de Rabadon',
          capacity: 100,
          value: user.backpack.value,
        };
        user.money -= 250000;
        for (let j = 0; j < 5; j++) {
          user.loots.splice(user.loots.findIndex((i) => i.name === filtradoRabadon[0].name), 1);
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        }

        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }
        user.save();
        return message.menheraReply('success', t('commands:village.ferreiro.mochila.change', { mochila: 'Mochila de Rabadon' }));
      } return message.menheraReply('error', t('commands:village.invalid-option'));
    });
  }

  static hotel(message, user, msg, t) {
    const embed = new MessageEmbed()
      .setTitle(`🏨 | ${t('commands:village.hotel.title')}`)
      .setDescription(t('commands:village:hotel.description'))
      .addFields([{
        name: `1 - ${t('commands:village.hotel.fields.name_one')}`,
        value: `⌛ | ${t('commands:village.hotel.fields.value', { time: 2, life: 40, mana: 30 })}`,
      },
      {
        name: `2 - ${t('commands:village.hotel.fields.name_two')}`,
        value: `⌛ | ${t('commands:village.hotel.fields.value', { time: '3,5', life: 'MAX', mana: 0 })}`,
      },
      {
        name: `3 - ${t('commands:village.hotel.fields.name_three')}`,
        value: `⌛ | ${t('commands:village.hotel.fields.value', { time: '3,5', life: 0, mana: 'MAX' })}`,
      },
      {
        name: `4 - ${t('commands:village.hotel.fields.name_four')}`,
        value: `⌛ | ${t('commands:village.hotel.fields.value', { time: '7', life: 'MAX', mana: 'MAX' })}`,
      },
      ])
      .setFooter(t('commands:village.hotel.footer'))
      .setColor('#e7a8ec');

    msg.edit(message.author, embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    const validOptions = ['1', '2', '3', '4'];

    collector.on('collect', (m) => {
      if (!validOptions.includes(m.content)) return message.menheraReply('error', t('commands:village.invalid-option'));

      if (user.hotelTime > Date.now()) return message.menheraReply('error', t('commands:village.hotel.already'));

      if (user.life < 1 && user.death > Date.now()) return message.menheraReply('error', t('commands:village.hotel.dead'));

      if (m.content === '1') {
        user.hotelTime = 7200000 + Date.now();
        user.life += 40;
        user.mana += 30;
      } else if (m.content === '2') {
        user.hotelTime = 12600000 + Date.now();
        user.life = user.maxLife;
      } else if (m.content === '3') {
        user.hotelTime = 12600000 + Date.now();
        user.mana = user.maxMana;
      } else if (m.content === '4') {
        user.hotelTime = 25200000 + Date.now();
        user.life = user.maxLife;
        user.mana = user.maxMana;
      }

      if (user.life > user.maxLife) user.life = user.maxLife;
      if (user.mana > user.maxMana) user.mana = user.maxMana;

      user.save();

      return message.menheraReply('success', t('commands:village.hotel.done'));
    });
  }

  static guilda(message, user, msg, t) {
    const allLoots = [];
    const nameLoots = [];

    user.loots.forEach((loot) => {
      allLoots.push(loot);
      nameLoots.push(loot.name);
    });

    let txt = t('commands:village.guilda.money', { money: user.money }) + t('commands:village.guilda.sell-all');

    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${t('commands:village.guilda.title')}`)
      .setColor('#98b849')
      .setFooter(t('commands:village.guilda.footer'));

    const contado = VillageCommand.countItems(nameLoots);
    const number = contado.length;

    contado.forEach((i) => {
      const filter = allLoots.filter((f) => f.name === i.name);
      txt += `---------------**[ ${number} ]**---------------\n<:Chest:760957557538947133> | **${i.name}** ( ${i.amount} )\n💎 | **${t('commands:village.guilda.value')}:** ${filter[0].value}\n`;
    });

    const texto = (txt.length > 1800) ? `${txt.slice(0, 1800)}...` : txt;

    embed.setDescription(texto);

    if (contado.length === 0) {
      return msg.edit(message.author, embed.setDescription(t('commands:village.guilda.no-loots')).setFooter('No Looots!').setColor('#f01010'));
    }

    msg.edit(message.author, embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    const option = [];

    for (let f = 0; f < number; f++) {
      option.push((f).toString());
    }

    collector.on('collect', (m) => {
      const args = m.content.trim().split(/ +/g);

      if (!option.includes(args[0])) return message.menheraReply('error', t('commands:village.invalid-option'));

      if (args[0] === '0') {
        let totalValue = 0;
        const totalItems = allLoots.length;

        allLoots.forEach((l) => {
          totalValue += l.value;
          if (user.backpack) {
            const newValue = user.backpack.value - 1;
            user.backpack = {
              name: user.backpack.name,
              capacity: user.backpack.capacity,
              value: newValue,
            };
          }
        });

        message.menheraReply('success', t('commands:village.guilda.sold-all', { amount: totalItems, value: totalValue }));

        user.loots = [];
        user.money += totalValue;
        if (user.backpack.value < 0) {
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: 0,
          };
        }
        return user.save();
      }

      const input = args[1];
      let quantidade;

      if (!input) {
        quantidade = 1;
      } else quantidade = parseInt(input.replace(/\D+/g, ''));

      if (quantidade < 1) return message.menheraReply('error', t('commands:village.invalid-quantity'));
      if (quantidade > contado[parseInt(args[0]) - 1].amount) return message.menheraReply('error', `${t('commands:village.guilda.poor')} ${quantidade} ${contado[parseInt(args[0]) - 1].name}`);

      const loot = allLoots.filter((f) => f.name === contado[parseInt(args[0]) - 1].name)[0];
      const valor = parseInt(quantidade) * parseInt(loot.value);
      if (Number.isNaN(valor)) return message.menheraReply('error', t('commands:village.guilda.unespected-error'));

      user.money += parseInt(valor);
      for (let j = 0; j < quantidade; j++) {
        user.loots.splice(
          user.loots.findIndex((i) => i.name === contado[parseInt(args[0]) - 1].name), 1,
        );
        if (user.backpack) {
          const newValue = user.backpack.value - 1;
          user.backpack = {
            name: user.backpack.name,
            capacity: user.backpack.capacity,
            value: newValue,
          };
        }
      }

      if (user.backpack.value < 0) {
        user.backpack = {
          name: user.backpack.name,
          capacity: user.backpack.capacity,
          value: 0,
        };
      }
      user.save();
      return message.menheraReply('success', t('commands:village.guilda.sold', { quantity: quantidade, name: contado[parseInt(args[0]) - 1].name, value: valor }));
    });
  }
};
