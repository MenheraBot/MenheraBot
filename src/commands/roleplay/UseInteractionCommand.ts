import { InventoryItem } from '@roleplay/Types';
import RPGUtil from '@roleplay/Utils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import Util, { actionRow } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';

export default class UseInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'usar',
      description: '【ＲＰＧ】Use algum item de seu inventário',
      category: 'roleplay',
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:usar.non-aventure') });
      return;
    }

    if (user.inBattle) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:usar.in-battle') });
      return;
    }
    if (user.death > Date.now()) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:usar.dead') });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(`💊 | ${ctx.locale('commands:usar.title')}`)
      .setColor('#ae98d8')
      .setDescription(
        ctx.locale('commands:usar.embed_description', {
          life: user.life,
          maxLife: user.maxLife,
          mana: user.mana,
          maxMana: user.maxMana,
        }),
      );

    let itemText = '';
    const items: InventoryItem[] = [];

    user.inventory.forEach((inv) => {
      if (inv.type !== 'Arma') items.push(inv);
    });

    const juntos = RPGUtil.countItems(items);

    const selector = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | USE`);

    juntos.forEach((count, i) => {
      selector.addOptions({ label: count.name, value: `${i}` });
      itemText += `------------**[ ${i + 1} ]**------------\n**${count.name}** ( ${
        count.amount
      } )\n`;
    });

    if (items.length > 0) {
      embed.addField(`💊 | ${ctx.locale('commands:usar.field_title')}`, itemText);
    } else {
      embed.setDescription(ctx.locale('commands:usar.out'));
      embed.setColor('#e53910');
      selector.setDisabled(true);
    }

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selector])] });

    const selected = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      10000,
    );

    if (!selected) {
      ctx.makeMessage({ components: [actionRow([selector.setDisabled(true)])] });
      return;
    }

    const choice = user.inventory.filter(
      (f) =>
        f.name ===
        user.inventory[
          user.inventory.findIndex((i) => i.name === juntos[Number(selected.values[0])].name)
        ].name,
    );

    selector.setOptions([]);

    for (let i = 1; i < juntos[Number(selected.values[0])].amount && i < 25; i += 1)
      selector.addOptions({ value: `${i}`, label: `${i}` });

    ctx.makeMessage({ components: [actionRow([selector])] });

    const selectAmount =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        8000,
      );

    const amount = selectAmount ? Number(selectAmount.values[0]) : 1;

    if (amount > juntos[Number(selected.values[0])].amount) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:usar.bigger') });
      return;
    }

    if (choice[0].name.indexOf('💧') > -1) {
      if (user.mana === user.maxMana) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:usar.full-mana') });
        return;
      }

      user.mana += (choice[0]?.damage ?? 1) * amount;
      if (user.mana > user.maxMana) user.mana = user.maxMana;
    } else if (choice[0].name.indexOf('🩸') > -1) {
      if (user.life === user.maxLife) {
        ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:usar.full-life') });
        return;
      }
      user.life += (choice[0]?.damage ?? 1) * amount;
      if (user.life > user.maxLife) user.life = user.maxLife;
    } else {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:usar.error') });
      return;
    }

    for (let i = 0; i < amount; i++) {
      user.inventory.splice(
        user.inventory.findIndex((item) => item.name === juntos[Number(selected.values[0])].name),
        1,
      );
    }

    ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      life: user.life,
      mana: user.mana,
      inventory: user.inventory,
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:usar.used', {
        amount,
        choice: choice[0].name,
        life: user.life,
        mana: user.mana,
        maxLife: user.maxLife,
        maxMana: user.maxMana,
      }),
    });
  }
}
