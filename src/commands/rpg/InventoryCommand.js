const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const { countItems } = require('../../utils/RPGUtil');

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

  async run({ message, authorData }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:inventory.non-aventure'));

    const cor = authorData.cor || '#8f877f';

    const embed = new MessageEmbed()
      .setTitle(`<:Chest:760957557538947133> | ${t('commands:inventory.title')}`)
      .setColor(cor);

    const items = user.inventory.filter((item) => item.type !== 'Arma');

    const normalizeItems = (arr) => countItems(arr).reduce((p, count) => `${p}**${count.name}** (${count.amount})\n`, '');
    const itemText = normalizeItems(items);
    const lootText = normalizeItems(user.loots);

    let armaText = '';
    armaText += `🗡️ | ${t('commands:inventory.weapon')}: **${user.weapon.name}**\n`;
    armaText += `🩸 | ${t('commands:inventory.dmg')}: **${user.weapon.damage}**\n\n`;
    armaText += `🧥 | ${t('commands:inventory.armor')}: **${user.protection.name}**\n`;
    armaText += `🛡️ | ${t('commands:inventory.prt')}: **${user.protection.armor}**\n`;

    if (user.backpack) embed.addField(`🧺 | ${t('commands:inventory.backpack')}`, t('commands:inventory.backpack-value', { name: user.backpack.name, max: user.backpack.capacity, value: user.backpack.value }));
    if (armaText.length > 0) embed.addField(`⚔️ | ${t('commands:inventory.battle')}`, armaText);
    if (items.length > 0) embed.addField(`💊 | ${t('commands:inventory.items')}`, itemText);
    if (lootText.length > 0) embed.addField(`<:Chest:760957557538947133> | ${t('commands:inventory.loots')}`, lootText);

    message.channel.send(message.author, embed);
  }
};
