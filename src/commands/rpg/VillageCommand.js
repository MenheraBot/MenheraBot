/* eslint-disable guard-for-in */
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const Command = require('../../structures/command');
const PagesCollector = require('../../utils/Pages');
const itemsFile = require('../../structures/RpgHandler').items;
const RPGUtil = require('../../utils/RPGUtil');
require('moment-duration-format');

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

    const options = ['bruxa', 'ferreiro', 'hotel', 'guilda'];
    const collector = new PagesCollector(message.channel, { sent, message, t }, { max: 2, time: 30000, errors: ['time'] })
      .setInvalidOption(() => collector.menheraReply('error', t('commands:village.invalid-option')))
      .setFindOption(PagesCollector.arrFindByElemOrIndex(options))
      .setHandle((_, option) => VillageCommand[option](message, user, t, collector))
      .start();
  }

  static async bruxa(message, user, t, collector) {
    const items = itemsFile.bruxa.filter((item) => user.level >= item.minLevel && (!item.maxLevel || user.level <= item.maxLevel));

    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${t('commands:village.bruxa.title')}`)
      .setColor('#c5b5a0')
      .setFooter(t('commands:village.bruxa.footer'))
      .setDescription(t('commands:village.bruxa.description', { money: user.money }))
      .addFields(
        items.map((item, i) => ({
          name: `---------------[ ${i + 1} ]---------------\n${item.name}`,
          value: `📜 | **${t('commands:village.desc')}:** ${item.description}\n💎 |** ${t('commands:village.cost')}:** ${item.value}`,

        })),
      );

    collector.send(message.author, embed);
    collector.setFindOption((content) => {
      const [query, qty = 1] = content.trim().split(/ +/g);
      const item = items.find((i, n) => i.name === query.toLowerCase() || Number(query) === (n + 1));
      if (item) return { item, qty: Number(qty) };
    });
    collector.setHandle((_, { item, qty }) => {
      if (Number.isNaN(qty) || qty < 1) {
        return collector.menheraReply('error', t('commands:village.invalid-quantity'));
      }

      const value = item.value * qty;

      if (!value) {
        return collector.menheraReply('error', t('commands:village.invalid-value'));
      }

      if (user.money < value) {
        return collector.menheraReply('error', t('commands:village.poor'));
      }

      const backpack = RPGUtil.getBackpack(user);
      if ((backpack.value + qty) > backpack.capacity) {
        return collector.menheraReply('error', 'commands:village.backpack-full');
      }

      collector.menheraReply('success', t('commands:village.bruxa.bought', { quantidade: qty, name: item.name, valor: value }));

      RPGUtil.addItemInLoots(user, { name: item.name, damage: item.damage }, qty);
      user.money -= value;
      user.save();

      collector.finish();
    });

    return PagesCollector.continue();
  }

  static ferreiro(message, user, t, collector) {
    if (user.level < 9) {
      return collector.menheraReply('error', t('commands:village.ferreiro.low-level', { level: 9 }));
    }

    const categories = ['sword', 'backpack', 'armor'];
    const categoriesNames = categories.map(
      (name, i) => `**${i + 1}** - ${t(`commands:village.ferreiro.categories.${name}`)}`,
    );
    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(t('commands:village.ferreiro.description'))
      .addField(t('commands:village.ferreiro.field_name'), categoriesNames)
      .setFooter(t('commands:village.ferreiro.footer'));

    collector.send(message.author, embed);
    collector.setFindOption(PagesCollector.arrFindByElemOrIndex(categories));
    collector.setHandle((_, category) => VillageCommand.ferreiroEquipamentos(category, message, user, t, collector));
    return PagesCollector.continue();
  }

  static ferreiroEquipamentos(category, message, user, t, collector) {
    const emojis = {
      sword: '🗡️',
      armor: '🛡️',
      backpack: '🧺',
    };

    const mainProp = {
      sword: 'damage',
      armor: 'protection',
      backpack: 'capacity',
    }[category];

    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${t('commands:village.ferreiro.title')}`)
      .setDescription(
        `<:atencao:759603958418767922> | ${t(`commands:village.ferreiro.${category}.description`)}`,
      )
      .setFooter(t('commands:village.ferreiro.footer'));

    const equips = itemsFile.ferreiro.filter((item) => (item.category === category) && !item.isNotTrade);

    const parseMissingItems = (equip) => Object.entries(equip.required_items)
      .reduce((p, [name, qty]) => `${p} **${qty} ${name}**\n`, '');

    embed.addFields(equips.map((equip, i) => ({
      name: `**${i + 1}** - ${equip.id}`,
      value: [
        `${emojis[category]} | ${t(`commands:village.ferreiro.${mainProp}`)} **${equip[mainProp]}**`,
        `💎 | ${t('commands:village.ferreiro.cost')}: **${equip.price}**`,
        `<:Chest:760957557538947133> | ${t('commands:village.ferreiro.itens-needed')}: ${parseMissingItems(equip)}`,
      ].join('\n'),
    })));

    const userItems = RPGUtil.countItems(user.loots);

    collector.send(message.author, embed);
    collector.setFindOption(PagesCollector.arrFindByItemNameOrIndex(equips));
    collector.setHandle((_, equip) => {
      if (user.money < equip.price) {
        return message.menheraReply('error', t('commands:village.poor'));
      }

      const requiredItems = Object.entries(equip.required_items);
      const missingItems = requiredItems
        .reduce((p, [name, qty]) => {
          const item = userItems.find((i) => i.name === name);
          if (!item) {
            return [...p, { name, qty }];
          }

          if (item.amount < qty) {
            return [...p, { name, qty: qty - item.amount }];
          }

          return p;
        }, []);

      if (missingItems.length > 0) {
        const items = missingItems.map((item) => `${item.qty} ${item.name}`).join(', ');

        return message.menheraReply('error', `${t(`commands:village.ferreiro.${category}.poor`, { items })}`);
      }

      requiredItems.forEach(([name, qty]) => RPGUtil.removeItemInLoots(user, name, qty));

      switch (category) {
        case 'sword':
          user.weapon = {
            name: equip.id,
            damage: equip.damage,
          };
          break;

        case 'armor':
          user.protection = {
            name: equip.id,
            armor: equip.protection,
          };
          break;

        case 'backpack':
          user.backpack = {
            name: equip.id,
          };
          break;
      }

      user.money -= equip.price;

      user.save();
      message.menheraReply('success', t(`commands:village.ferreiro.${category}.change`, { equip: equip.id }));
      collector.finish();
    });
    return PagesCollector.continue();
  }

  static hotel(message, user, t, collector) {
    const embed = new MessageEmbed()
      .setTitle(`🏨 | ${t('commands:village.hotel.title')}`)
      .setDescription(t('commands:village:hotel.description'))
      .setFooter(t('commands:village.hotel.footer'))
      .setColor('#e7a8ec');

    embed.addFields(itemsFile.hotel.map(({
      name, time, life, mana,
    }, i) => ({
      name: `${i + 1} - ${t(`commands:village.hotel.fields.${name}`)}`,
      value: `⌛ | ${t('commands:village.hotel.fields.value', { time: moment.duration(time).format('D[d], H[h], m[m], s[s]', { trim: 'both' }), life, mana })}`,
    })));

    collector.send(message.author, embed);
    collector.setFindOption(PagesCollector.arrFindByIndex(itemsFile.hotel));
    collector.setHandle((_, option) => {
      if (user.hotelTime > Date.now()) {
        return collector.menheraReply('error', t('commands:village.hotel.already'));
      }
      if (user.life < 1 && user.death > Date.now()) {
        return collector.menheraReply('error', t('commands:village.hotel.dead'));
      }

      user.hotelTime = option.time + Date.now();

      if (option.life === 'MAX') {
        user.life = user.maxLife;
      } else {
        user.life += option.life;
        if (user.life > user.maxLife) user.life = user.maxLife;
      }

      if (option.mana === 'MAX') {
        user.mana = user.maxMana;
      } else {
        user.mana += option.mana;
        if (user.mana > user.maxMana) user.mana = user.maxMana;
      }

      user.save();

      collector.menheraReply('success', t('commands:village.hotel.done'));
      collector.finish();
    });
    return PagesCollector.continue();
  }

  static guilda(message, user, t, collector) {
    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${t('commands:village.guilda.title')}`)
      .setColor('#98b849')
      .setFooter(t('commands:village.guilda.footer'));

    const allItems = RPGUtil.countItems(user.loots);

    if (allItems.length === 0) {
      return collector.send(message.author,
        embed
          .setDescription(t('commands:village.guilda.no-loots'))
          .setFooter('No Looots!')
          .setColor('#f01010'));
    }

    let txt = t('commands:village.guilda.money', { money: user.money }) + t('commands:village.guilda.sell-all');

    let displayedItems = allItems;
    // eslint-disable-next-line no-restricted-syntax
    for (const i in allItems) {
      // eslint-disable-next-line no-loop-func
      const separator = `---------------**[ ${parseInt(i) + 1} ]**---------------`;
      const name = `<:Chest:760957557538947133> | **${allItems[i].name}** ( ${allItems[i].amount} )`;
      const value = `💎 | **${t('commands:village.guilda.value')}:** ${allItems[i].value}\n`;
      const item = `${separator}\n ${name}\n ${value}`;
      if ((txt.length + item.length) <= 1800) {
        txt += item;
      } else {
        displayedItems = displayedItems.slice(0, i);
        break;
      }
    }

    embed.setDescription(txt);

    collector.send(message.author, embed);
    collector.setFindOption((content) => {
      if (Number(content) === 0) {
        return 'ALL';
      }
      const [query, qty = 1] = content.trim().split(/ +/g);
      const item = displayedItems.find((_, i) => Number(query) === (i + 1));
      if (item) {
        return [item, qty];
      }
    });
    collector.setHandle((_, result) => {
      collector.finish();

      if (result === 'ALL') {
        const total = allItems.reduce((p, item) => p + item.value, 0);
        user.loots = [];
        user.money += total;
        user.save();

        return collector.menheraReply('success', t('commands:village.guilda.sold-all', { amount: allItems.length, value: total }));
      }

      const [item, qty] = result;

      if (qty < 1) {
        return message.menheraReply('error', t('commands:village.invalid-quantity'));
      }

      if (qty > item.amount) {
        return message.menheraReply('error', `${t('commands:village.guilda.poor')} ${qty} ${item.name}`);
      }

      const total = parseInt(qty) * parseInt(item.value);
      if (Number.isNaN(total)) {
        return message.menheraReply('error', t('commands:village.guilda.unespected-error'));
      }

      RPGUtil.removeItemInLoots(user, item.name, qty);
      user.money += total;

      user.save();
      return message.menheraReply('success', t('commands:village.guilda.sold', { quantity: qty, name: item.name, value: total }));
    });
    return PagesCollector.continue();
  }
};
