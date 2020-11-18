const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');

function countItems(arr) {
  return arr.reduce((p, v) => {
    const exists = p.findIndex((x) => x.name === v);
    if (exists !== -1) {
      p[exists].amount += 1;
      return p;
    }
    return [...p, { name: v, amount: 1 }];
  }, []);
}

module.exports = class UseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'use',
      aliases: ['usar'],
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run({ message, args, server }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:use.non-aventure'));

    if (user.inBattle) return message.menheraReply('error', t('commands:use.in-battle'));
    if (parseInt(user.death) > Date.now()) return message.menheraReply('error', t('commands:use.dead'));

    const embed = new MessageEmbed()
      .setTitle(`💊 | ${t('commands:use.title')}`)
      .setColor('#ae98d8')
      .setDescription(t('commands:use.embed_description', {
        prefix: server.prefix, life: user.life, maxLife: user.maxLife, mana: user.mana, maxMana: user.maxMana,
      }));

    let itemText = '';
    const items = [];

    let number = 0;
    const option = [];

    user.inventory.forEach((inv) => {
      items.push(inv.name);
    });

    const juntos = countItems(items);

    juntos.forEach((count) => {
      number++;
      option.push(number.toString());
      itemText += `------------**[ ${number} ]**------------\n**${count.name}** ( ${count.amount} )\n`;
    });

    if (items.length > 0) {
      embed.addField(`💊 | ${t('commands:use.field_title')}`, itemText);
    } else {
      embed.setDescription(t('commands:use.out'));
      embed.setColor('#e53910');
    }

    if (!args[0]) return message.channel.send(message.author, embed);

    if (!option.includes(args[0])) return message.menheraReply('error', t('commands:use.invalid-option'));

    const choice = user.inventory.filter((f) => f.name === user.inventory[user.inventory.findIndex((i) => i.name === juntos[args[0] - 1].name)].name);

    const input = args[1];
    let quantidade;

    if (!input) {
      quantidade = 1;
    } else quantidade = parseInt(input.replace(/\D+/g, ''));

    if (Number.isNaN(quantidade)) quantidade = 1;

    if (quantidade < 1) return message.menheraReply('error', t('commands:use.invalid-option'));

    if (quantidade > juntos[args[0] - 1].amount) return message.menheraReply('error', t('commands:use.bigger'));

    if (choice[0].name.indexOf('💧') > -1) {
      if (user.mana === user.maxMana) return message.menheraReply('error', t('commands:use.full-mana'));
      user.mana += (choice[0].damage * quantidade);
      if (user.mana > user.maxMana) user.mana = user.maxMana;
    } else if (choice[0].name.indexOf('🩸') > -1) {
      if (user.life === user.maxLife) return message.menheraReply('error', t('commands:use.full-life'));
      user.life += (choice[0].damage * quantidade);
      if (user.life > user.maxLife) user.life = user.maxLife;
    } else return message.menheraReply('error', t('commands:use.error'));

    for (let i = 0; i < quantidade; i++) {
      user.inventory.splice(user.inventory.findIndex((item) => item.name === juntos[args[0] - 1].name), 1);

      if (user.backpack) {
        const newValue = user.backpack.value - 1;
        user.backpack = { name: user.backpack.name, capacity: user.backpack.capacity, value: newValue };
      }
    }
    if (user.backpack.value < 0) user.backpack = { name: user.backpack.name, capacity: user.backpack.capacity, value: 0 };
    user.save();

    message.menheraReply('success', t('commands:use.used', { quantidade, choice: choice[0].name }));
  }
};
