import { MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import RpgUtil from '@utils/RPGUtil';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';

export default class UseCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'use',
      aliases: ['usar'],
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: CommandContext) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:use.non-aventure');

    if (user.inBattle) return ctx.replyT('error', 'commands:use.in-battle');
    if (parseInt(user.death) > Date.now()) return ctx.replyT('error', 'commands:use.dead');

    const embed = new MessageEmbed()
      .setTitle(`💊 | ${ctx.locale('commands:use.title')}`)
      .setColor('#ae98d8')
      .setDescription(
        ctx.locale('commands:use.embed_description', {
          prefix: ctx.data.server.prefix,
          life: user.life,
          maxLife: user.maxLife,
          mana: user.mana,
          maxMana: user.maxMana,
        }),
      );

    let itemText = '';
    const items = [];

    let number = 0;
    const option = [];

    user.inventory.forEach((inv) => {
      if (inv.type !== 'Arma') items.push(inv.name);
    });

    const juntos = RpgUtil.countItems(items);

    juntos.forEach((count) => {
      number++;
      option.push(number.toString());
      itemText += `------------**[ ${number} ]**------------\n**${count.name}** ( ${count.amount} )\n`;
    });

    if (items.length > 0) {
      embed.addField(`💊 | ${ctx.locale('commands:use.field_title')}`, itemText);
    } else {
      embed.setDescription(ctx.locale('commands:use.out'));
      embed.setColor('#e53910');
    }

    if (!ctx.args[0]) return ctx.sendC(ctx.message.author.toString(), embed);

    if (!option.includes(ctx.args[0])) return ctx.replyT('error', 'commands:use.invalid-option');

    const choice = user.inventory.filter(
      (f) =>
        f.name ===
        user.inventory[
          user.inventory.findIndex((i) => i.name === juntos[parseInt(ctx.args[0]) - 1].name)
        ].name,
    );

    const input = ctx.args[1];
    let quantidade: number;

    if (!input) {
      quantidade = 1;
    } else quantidade = parseInt(input.replace(/\D+/g, ''));

    if (Number.isNaN(quantidade)) quantidade = 1;

    if (quantidade < 1) return ctx.replyT('error', 'commands:use.invalid-option');

    if (quantidade > juntos[parseInt(ctx.args[0]) - 1].amount)
      return ctx.replyT('error', 'commands:use.bigger');

    if (choice[0].name.indexOf('💧') > -1) {
      if (user.mana === user.maxMana) return ctx.replyT('error', 'commands:use.full-mana');
      user.mana += choice[0].damage * quantidade;
      if (user.mana > user.maxMana) user.mana = user.maxMana;
    } else if (choice[0].name.indexOf('🩸') > -1) {
      if (user.life === user.maxLife) return ctx.replyT('error', 'commands:use.full-life');
      user.life += choice[0].damage * quantidade;
      if (user.life > user.maxLife) user.life = user.maxLife;
    } else return ctx.replyT('error', 'commands:use.error');

    for (let i = 0; i < quantidade; i++) {
      user.inventory.splice(
        user.inventory.findIndex((item) => item.name === juntos[parseInt(ctx.args[0]) - 1].name),
        1,
      );
    }

    await user.save();

    ctx.replyT('success', 'commands:use.used', {
      quantidade,
      choice: choice[0].name,
      life: user.life,
      mana: user.mana,
      maxLife: user.maxLife,
      maxMana: user.maxMana,
    });
  }
}
