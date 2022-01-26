import { InventoryItem } from '@roleplay/Types';
import RPGUtil from '@roleplay/Utils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'inventario',
      description: '【ＲＰＧ】Abra seu inventario',
      category: 'roleplay',
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:rpg_inventario.non-aventure'),
      });
      return;
    }
    const embed = new MessageEmbed()
      .setTitle(`<:Chest:760957557538947133> | ${ctx.locale('commands:rpg_inventario.title')}`)
      .setColor(ctx.data.user.selectedColor);

    const items = user.inventory.filter((item) => item.type !== 'Arma');

    const normalizeItems = (arr: InventoryItem[]) =>
      RPGUtil.countItems(arr).reduce((p, count) => `${p}**${count.name}** (${count.amount})\n`, '');
    const itemText = normalizeItems(items);
    const lootText = normalizeItems(user.loots);

    let armaText = '';
    armaText += `🗡️ | ${ctx.locale('commands:rpg_inventario.weapon')}: **${user.weapon.name}**\n`;
    armaText += `🩸 | ${ctx.locale('commands:rpg_inventario.dmg')}: **${user.weapon.damage}**\n\n`;
    armaText += `🧥 | ${ctx.locale('commands:rpg_inventario.armor')}: **${
      user.protection.name
    }**\n`;
    armaText += `🛡️ | ${ctx.locale('commands:rpg_inventario.prt')}: **${user.protection.armor}**\n`;

    const backpack = RPGUtil.getBackpack(user);
    if (backpack)
      embed.addField(
        `🧺 | ${ctx.locale('commands:rpg_inventario.backpack')}`,
        ctx.locale('commands:rpg_inventario.backpack-value', {
          name: backpack.name,
          max: backpack.capacity,
          value: backpack.value,
        }),
      );
    if (armaText.length > 0)
      embed.addField(`⚔️ | ${ctx.locale('commands:rpg_inventario.battle')}`, armaText);
    if (items.length > 0)
      embed.addField(`💊 | ${ctx.locale('commands:rpg_inventario.items')}`, itemText);
    if (lootText.length > 0)
      embed.addField(
        `<:Chest:760957557538947133> | ${ctx.locale('commands:rpg_inventario.loots')}`,
        lootText,
      );

    ctx.makeMessage({ embeds: [embed] });
  }
}
