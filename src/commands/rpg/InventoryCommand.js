const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/Command');
const RPGUtil = require('../../utils/RPGUtil');
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

  async run(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:inventory.non-aventure');

    const cor = ctx.data.user?.cor ?? '#8f877f';

    const embed = new MessageEmbed()
      .setTitle(`<:Chest:760957557538947133> | ${ctx.locale('commands:inventory.title')}`)
      .setColor(cor);

    const items = user.inventory.filter((item) => item.type !== 'Arma');

    const normalizeItems = (arr) =>
      countItems(arr).reduce(
        (p, count) =>
          `${p}**${
            count.job_id > 0 ? ctx.locale(`roleplay:job.${count.job_id}.${count.name}`) : count.name
          }** (${count.amount})\n`,
        '',
      );
    const itemText = normalizeItems(items);
    const lootText = normalizeItems(user.loots);

    let armaText = '';
    armaText += `🗡️ | ${ctx.locale('commands:inventory.weapon')}: **${user.weapon.name}**\n`;
    armaText += `🩸 | ${ctx.locale('commands:inventory.dmg')}: **${user.weapon.damage}**\n\n`;
    armaText += `🧥 | ${ctx.locale('commands:inventory.armor')}: **${user.protection.name}**\n`;
    armaText += `🛡️ | ${ctx.locale('commands:inventory.prt')}: **${user.protection.armor}**\n`;

    const backpack = RPGUtil.getBackpack(user);
    if (backpack)
      embed.addField(
        `🧺 | ${ctx.locale('commands:inventory.backpack')}`,
        ctx.locale('commands:inventory.backpack-value', {
          name: backpack.name,
          max: backpack.capacity,
          value: backpack.value,
        }),
      );
    if (armaText.length > 0)
      embed.addField(`⚔️ | ${ctx.locale('commands:inventory.battle')}`, armaText);
    if (items.length > 0)
      embed.addField(`💊 | ${ctx.locale('commands:inventory.items')}`, itemText);
    if (lootText.length > 0)
      embed.addField(
        `<:Chest:760957557538947133> | ${ctx.locale('commands:inventory.loots')}`,
        lootText,
      );

    ctx.sendC(ctx.message.author, embed);
  }
};
