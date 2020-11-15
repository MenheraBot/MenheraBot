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
module.exports = class InventoryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'inventory',
      aliases: ['inventario', 'inv', 'inventário'],
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run({ message }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:inventory.non-aventure'));

    const usuarioInDb = await this.client.database.Users.findOne({ id: message.author.id });

    const cor = usuarioInDb.cor || '#8f877f';

    const embed = new MessageEmbed()
      .setTitle(`<:Chest:760957557538947133> | ${t('commands:inventory.title')}`)
      .setColor(cor);

    const loots = [];
    const items = [];
    let lootText = '';
    let armaText = '';
    let itemText = '';

    if (user.loots.length > 0) {
      user.loots.forEach((lot) => {
        loots.push(lot.name);
      });
    }

    user.inventory.forEach((inv) => {
      if (inv.type === 'Item') {
        items.push(inv.name);
      }
    });

    armaText += `🗡️ | ${t('commands:inventory.weapon')}: **${user.weapon.name}**\n🩸 | ${t('commands:inventory.dmg')}: **${user.weapon.damage}**\n\n`;
    armaText += `🧥 | ${t('commands:inventory.armor')}: **${user.protection.name}**\n🛡️ | ${t('commands:inventory.prt')}: **${user.protection.armor}**\n`;

    countItems(items).forEach((count) => {
      itemText += `**${count.name}** (${count.amount})\n`;
    });

    countItems(loots).forEach((count) => {
      lootText += `**${count.name}** ( ${count.amount} )\n`;
    });

    if (user.backpack) embed.addField(`🧺 | ${t('commands:inventory.backpack')}`, t('commands:inventory.backpack-value', { name: user.backpack.name, max: user.backpack.capacity, value: user.backpack.value }));
    if (armaText.length > 0) embed.addField(`⚔️ | ${t('commands:inventory.battle')}`, armaText);
    if (items.length > 0) embed.addField(`💊 | ${t('commands:inventory.items')}`, itemText);
    if (lootText.length > 0) embed.addField(`<:Chest:760957557538947133> | ${t('commands:inventory.loots')}`, lootText);

    message.channel.send(message.author, embed);
  }
};
