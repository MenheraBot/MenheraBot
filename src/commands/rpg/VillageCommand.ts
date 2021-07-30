/* eslint-disable guard-for-in */
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import moment from 'moment';
import Command from '@structures/Command';
import PagesCollector from '@utils/Pages';
import { items as itemsFile } from '@structures/RpgHandler';
import RPGUtil from '@utils/RPGUtil';
import 'moment-duration-format';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import {
  IBruxaItem,
  IFerreiroItem,
  IHotelItem,
  IInventoryItem,
  IRequiredItems,
  IUserRpgSchema,
  TFerreiroOptions,
  TVilaOptions,
} from '@utils/Types';

export default class VillageCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'village',
      aliases: ['vila'],
      cooldown: 5,
      category: 'rpg',
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  static async bruxa(
    ctx: CommandContext,
    user: IUserRpgSchema,
    collector: PagesCollector,
  ): Promise<string> {
    const items = itemsFile.bruxa.filter(
      (item) => user.level >= item.minLevel && (!item.maxLevel || user.level <= item.maxLevel),
    );

    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${ctx.locale('commands:village.bruxa.title')}`)
      .setColor('#c5b5a0')
      .setFooter(ctx.locale('commands:village.bruxa.footer'))
      .setDescription(ctx.locale('commands:village.bruxa.description', { money: user.money }))
      .addFields(
        items.map((item, i) => ({
          name: `---------------[ ${i + 1} ]---------------\n${item.name}`,
          value: `📜 | **${ctx.locale('commands:village.desc')}:** ${
            item.description
          }\n💎 |** ${ctx.locale('commands:village.cost')}:** ${item.value}`,
        })),
      );

    await collector.send(ctx.message.author, embed);
    collector.setFindOption((content: string) => {
      const [query, qty = 1] = content.trim().split(/ +/g);
      const item = items.find((i, n) => i.name === query.toLowerCase() || Number(query) === n + 1);
      if (item) return { item, qty: Number(qty) };
    });
    collector.setHandle((_: unknown, { item, qty }: { item: IBruxaItem; qty: number }) => {
      if (Number.isNaN(qty) || qty < 1) {
        return collector.replyT('error', 'commands:village.invalid-quantity');
      }

      const value = item.value * qty;

      if (!value) {
        return collector.replyT('error', 'commands:village.invalid-value');
      }

      if (user.money < value) {
        return collector.replyT('error', 'commands:village.poor');
      }

      const backpack = RPGUtil.getBackpack(user);
      if (backpack.value + qty > backpack.capacity) {
        return collector.replyT('error', 'commands:village.backpack-full');
      }

      collector.replyT('success', 'commands:village.bruxa.bought', {
        quantidade: qty,
        name: item.name,
        valor: value,
      });

      RPGUtil.addItemInInventory(user, { name: item.name, damage: item.damage }, qty);
      user.money -= value;
      user.save();

      collector.finish();
    });

    return PagesCollector.continue();
  }

  static async ferreiro(
    ctx: CommandContext,
    user: IUserRpgSchema,
    collector: PagesCollector,
  ): Promise<Message | string> {
    if (user.level < 9) {
      return collector.replyT('error', 'commands:village.ferreiro.low-level', { level: 9 });
    }

    const categories: TFerreiroOptions[] = ['sword', 'backpack', 'armor'];
    const categoriesNames = categories.map(
      (name, i) => `**${i + 1}** - ${ctx.locale(`commands:village.ferreiro.categories.${name}`)}`,
    );
    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${ctx.locale('commands:village.ferreiro.title')}`)
      .setDescription(ctx.locale('commands:village.ferreiro.description'))
      .addField(ctx.locale('commands:village.ferreiro.field_name'), categoriesNames)
      .setFooter(ctx.locale('commands:village.ferreiro.footer'));

    await collector.send(ctx.message.author, embed);
    collector.setFindOption(PagesCollector.arrFindByElemOrIndex(categories));
    collector.setHandle((_: unknown, category: TFerreiroOptions) =>
      VillageCommand.ferreiroEquipamentos(category, ctx, user, collector),
    );
    return PagesCollector.continue();
  }

  static async ferreiroEquipamentos(
    category: TFerreiroOptions,
    ctx: CommandContext,
    user: IUserRpgSchema,
    collector: PagesCollector,
  ): Promise<Message | string> {
    const emojis = {
      sword: '🗡️',
      armor: '🛡️',
      backpack: '🧺',
    };

    const mainProp: 'damage' | 'protection' | 'capacity' = {
      sword: 'damage' as 'damage' | 'protection' | 'capacity',
      armor: 'protection' as 'damage' | 'protection' | 'capacity',
      backpack: 'capacity' as 'damage' | 'protection' | 'capacity',
    }[category];

    const embed = new MessageEmbed()
      .setColor('#b99c81')
      .setTitle(`⚒️ | ${ctx.locale('commands:village.ferreiro.title')}`)
      .setDescription(
        `<:atencao:759603958418767922> | ${ctx.locale(
          `commands:village.ferreiro.${category}.description`,
        )}`,
      )
      .setFooter(ctx.locale('commands:village.ferreiro.footer'));

    const equips = itemsFile.ferreiro.filter(
      (item) => item.category === category && !item.isNotTrade,
    );

    const parseMissingItems = (equip: IFerreiroItem) =>
      Object.entries(equip.required_items as IRequiredItems).reduce(
        (p, [name, qty]) => `${p} **${qty} ${name}**\n`,
        '',
      );

    embed.addFields(
      equips.map((equip, i) => ({
        name: `**${i + 1}** - ${equip.id}`,
        value: [
          `${emojis[category]} | ${ctx.locale(`commands:village.ferreiro.${mainProp}`)} **${
            equip[mainProp]
          }**`,
          `💎 | ${ctx.locale('commands:village.ferreiro.cost')}: **${equip.price}**`,
          `<:Chest:760957557538947133> | ${ctx.locale(
            'commands:village.ferreiro.itens-needed',
          )}: ${parseMissingItems(equip)}`,
        ].join('\n'),
      })),
    );

    const userItems = RPGUtil.countItems(user.loots);

    await collector.send(ctx.message.author, embed);
    collector.setFindOption(PagesCollector.arrFindByItemNameOrIndex(equips));
    collector.setHandle(
      // eslint-disable-next-line camelcase
      (_: unknown, equip: IFerreiroItem & { price: number; required_items: IRequiredItems }) => {
        if (user.money < equip.price) {
          return ctx.replyT('error', 'commands:village.poor');
        }

        const requiredItems = Object.entries(equip.required_items);
        const missingItems = requiredItems.reduce(
          (p: { qty: number; name: string }[], [name, qty]) => {
            const item = userItems.find((i) => i.name === name);
            if (!item) {
              return [...p, { name, qty }];
            }

            if (item.amount < qty) {
              return [...p, { name, qty: (qty as number) - item.amount }];
            }

            return p;
          },
          [],
        );

        if (missingItems.length > 0) {
          const items = missingItems.map((item) => `${item.qty} ${item.name}`).join(', ');

          return ctx.reply(
            'error',
            `${ctx.locale(`commands:village.ferreiro.${category}.poor`, { items })}`,
          );
        }

        requiredItems.forEach(([name, qty]) => RPGUtil.removeItemInLoots(user, name, qty));

        switch (category) {
          case 'sword':
            user.weapon = {
              name: equip.id,
              damage: equip.damage as number,
            };
            break;

          case 'armor':
            user.protection = {
              name: equip.id,
              armor: equip.protection as number,
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
        ctx.replyT('success', `commands:village.ferreiro.${category}.change`, { equip: equip.id });
        collector.finish();
      },
    );
    return PagesCollector.continue();
  }

  static async hotel(
    ctx: CommandContext,
    user: IUserRpgSchema,
    collector: PagesCollector,
  ): Promise<Message | string> {
    const embed = new MessageEmbed()
      .setTitle(`🏨 | ${ctx.locale('commands:village.hotel.title')}`)
      .setDescription(ctx.locale('commands:village:hotel.description'))
      .setFooter(ctx.locale('commands:village.hotel.footer'))
      .setColor('#e7a8ec');

    embed.addFields(
      itemsFile.hotel.map(({ name, time, life, mana }, i) => ({
        name: `${i + 1} - ${ctx.locale(`commands:village.hotel.fields.${name}`)}`,
        value: `⌛ | ${ctx.locale('commands:village.hotel.fields.value', {
          time: moment.duration(time).format('D[d], H[h], m[m], s[s]', { trim: 'both' }),
          life,
          mana,
        })}`,
      })),
    );

    await collector.send(ctx.message.author, embed);
    collector.setFindOption(PagesCollector.arrFindByIndex(itemsFile.hotel));
    collector.setHandle(async (_: unknown, option: IHotelItem) => {
      if (parseInt(user.hotelTime) > Date.now()) {
        return collector.replyT('error', 'commands:village.hotel.already');
      }
      if (user.life < 1 && parseInt(user.death) > Date.now()) {
        return collector.replyT('error', 'commands:village.hotel.dead');
      }

      user.hotelTime = `${option.time + Date.now()}`;

      if (!option) {
        collector.finish();
        return ctx.replyT('error', 'commands:village.number-error');
      }

      if (option.life === 'MAX') {
        user.life = user.maxLife;
      } else {
        if (Number.isNaN(option.life)) {
          collector.finish();
          return ctx.replyT('error', 'commands:village.number-error');
        }
        user.life += option.life;
        if (user.life > user.maxLife) user.life = user.maxLife;
      }

      if (option.mana === 'MAX') {
        user.mana = user.maxMana;
      } else {
        user.mana += option.mana;
        if (Number.isNaN(option.life)) {
          collector.finish();
          return ctx.replyT('error', 'commands:village.number-error');
        }
        if (user.mana > user.maxMana) user.mana = user.maxMana;
      }

      await user.save();

      await collector.replyT('success', 'commands:village.hotel.done');
      collector.finish();
    });
    return PagesCollector.continue();
  }

  static async guilda(
    ctx: CommandContext,
    user: IUserRpgSchema,
    collector: PagesCollector,
  ): Promise<Message | string> {
    const embed = new MessageEmbed()
      .setTitle(`🏠 | ${ctx.locale('commands:village.guilda.title')}`)
      .setColor('#98b849')
      .setFooter(ctx.locale('commands:village.guilda.footer'));

    const allItems = RPGUtil.countItems(user.loots);

    if (allItems.length === 0) {
      return collector.send(
        ctx.message.author,
        embed
          .setDescription(ctx.locale('commands:village.guilda.no-loots'))
          .setFooter('No Looots!')
          .setColor('#f01010'),
      );
    }

    let txt =
      ctx.locale('commands:village.guilda.money', { money: user.money }) +
      ctx.locale('commands:village.guilda.sell-all');

    let displayedItems = allItems;
    // eslint-disable-next-line no-restricted-syntax
    for (const i in allItems) {
      // eslint-disable-next-line no-loop-func
      const separator = `---------------**[ ${parseInt(i) + 1} ]**---------------`;
      const name = `<:Chest:760957557538947133> | **${
        allItems[i].job_id
          ? ctx.locale(`roleplay:job.${allItems[i].job_id}.${allItems[i].name}`)
          : allItems[i].name
      }** ( ${allItems[i].amount} )`;
      const value = `💎 | **${ctx.locale('commands:village.guilda.value')}:** ${
        allItems[i].value
      }\n`;
      const item = `${separator}\n ${name}\n ${value}`;
      if (txt.length + item.length <= 1800) {
        txt += item;
      } else {
        displayedItems = displayedItems.slice(0, parseInt(i));
        break;
      }
    }

    embed.setDescription(txt);

    await collector.send(ctx.message.author, embed);
    collector.setFindOption((content: string) => {
      if (Number(content) === 0) {
        return 'ALL';
      }
      const [query, qty = 1] = content.trim().split(/ +/g);
      const qtyFiltred = qty === 1 ? qty : qty.replace(/\D+/g, '');
      const item = displayedItems.find((_, i) => Number(query) === i + 1);
      if (item) {
        return [item, qtyFiltred];
      }
    });
    collector.setHandle(
      async (
        _: unknown,
        result: 'ALL' | [item: IInventoryItem & { amount: number }, qty: number],
      ) => {
        collector.finish();

        if (result === 'ALL') {
          let sold = 0;
          const total = allItems.reduce((p, item) => {
            sold += item.amount;
            return p + (item.value as number) * item.amount;
          }, 0);
          user.loots = [];
          user.money += total;
          await user.save();

          return collector.replyT('success', 'commands:village.guilda.sold-all', {
            amount: sold,
            value: total,
          });
        }

        const [item, qty] = result;

        if (qty < 1) {
          return ctx.replyT('error', 'commands:village.invalid-quantity');
        }

        if (qty > item.amount) {
          return ctx.reply(
            'error',
            `${ctx.locale('commands:village.guilda.poor')} ${qty} ${
              item.job_id && item.job_id > 0
                ? ctx.locale(`roleplay:job.${item.job_id}.${item.name}`)
                : item.name
            }`,
          );
        }

        const total = qty * (item.value as number);
        if (Number.isNaN(total)) {
          return ctx.replyT('error', 'commands:village.guilda.unespected-error');
        }

        RPGUtil.removeItemInLoots(user, item.name, qty);
        user.money += total;

        await user.save();
        const itemNameTranslate =
          item.job_id && item.job_id > 0
            ? ctx.locale(`roleplay:job.${item.job_id}.${item.name}`)
            : item.name;
        return ctx.replyT('success', 'commands:village.guilda.sold', {
          quantity: qty,
          name: itemNameTranslate,
          value: total,
        });
      },
    );
    return PagesCollector.continue();
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const user = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
    if (ctx.message.channel.type === 'dm') return;

    if (!user) {
      return ctx.replyT('error', 'commands:village.non-aventure');
    }

    const embed = new MessageEmbed()
      .setColor('#bbfd7c')
      .setTitle(ctx.locale('commands:village.index.title'))
      .setDescription(ctx.locale('commands:village.index.description'))
      .addField(
        ctx.locale('commands:village.index.field_name'),
        ctx.locale('commands:village.index.field_value'),
      )
      .setFooter(ctx.locale('commands:village.index.footer'));

    const sent = await ctx.sendC(ctx.message.author.toString(), embed);

    const options = ['bruxa', 'ferreiro', 'hotel', 'guilda'];
    const collector = new PagesCollector(
      ctx.message.channel as TextChannel,
      { sent, ctx },
      { max: 2, time: 60000 },
    )
      .setInvalidOption(() => collector.replyT('error', 'commands:village.invalid-option'))
      .setFindOption(PagesCollector.arrFindByElemOrIndex(options))
      .setHandle((_: unknown, option: TVilaOptions) => VillageCommand[option](ctx, user, collector))
      .start();
  }
}
