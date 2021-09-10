import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import {
  MessageActionRowOptions,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import BasicFunctions from '../BasicFunctions';
import { IRpgUserSchema } from '../Types';
import { canBuy, resolveCustomId } from '../Utils';

export default async (ctx: InteractionCommandContext, user: IRpgUserSchema): Promise<void> => {
  const embed = new MessageEmbed()
    .setTitle(ctx.locale('buildings:mart.embed-title'))
    .setColor(ctx.data.user.cor)
    .setDescription(ctx.locale('buildings:mart.embed-description'));

  const sellButton = new MessageButton()
    .setCustomId(`${ctx.interaction.id} | SELL`)
    .setStyle('PRIMARY')
    .setLabel(ctx.locale('buildings:mart.sell'));

  const buyButton = new MessageButton()
    .setCustomId(`${ctx.interaction.id} | BUY`)
    .setStyle('PRIMARY')
    .setLabel(ctx.locale('buildings:mart.buy'));

  if (user.inventory.length === 0) sellButton.setDisabled(true);

  ctx.editReply({
    embeds: [embed],
    components: [{ type: 'ACTION_ROW', components: [sellButton, buyButton] }],
  });

  const filter = (int: MessageComponentInteraction) =>
    int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.author.id;

  const collect = ctx.channel.createMessageComponentCollector({ filter, max: 7, time: 15000 });

  collect.on('end', async () => {
    const reply = await ctx.interaction.fetchReply().catch(() => null);
    if (!reply) return;
    if (reply.components && reply.components?.length > 0) {
      ctx.editReply({
        components: [],
      });
    }
  });

  collect.on('collect', async (int) => {
    collect.resetTimer({ time: 20000 });
    int.deferUpdate();

    switch (resolveCustomId(int.customId)) {
      case 'BUY': {
        const itemsToApear = await ctx.client.repositories.rpgRepository.getUserEnochiaMart(
          int.user.id,
          user.level,
          ctx.client.boleham.Items,
        );

        embed
          .setDescription(
            ctx.locale('buildings:mart.buy-desc', {
              emojis: {
                gold: emojis.roleplay_custom.gold,
                silver: emojis.roleplay_custom.silver,
                bronze: emojis.roleplay_custom.bronze,
              },
              money: user.money,
            }),
          )
          .setTitle(ctx.locale('buildings:mart.buy-title'));

        const selectMenu = new MessageSelectMenu()
          .setMinValues(1)
          .setMaxValues(9)
          .setPlaceholder(ctx.locale('common:select-all-values'))
          .setCustomId(`${ctx.interaction.id} | BUY_CHOOSE`);

        itemsToApear.armors.forEach((a, i) => {
          const item = ctx.client.boleham.Functions.getItemById(a.id);
          selectMenu.addOptions({
            label: ctx.locale(`items:${a.id}.name`),
            value: `${a.id} ${a.level} ${i}`,
            description: ctx.locale(`items:${a.id}.description`),
          });
          embed.addField(
            `${ctx.locale(`items:${a.id}.name`)} | ${ctx.locale('common:level', {
              level: a.level,
            })}`,
            `${ctx.locale(`items:${a.id}.description`)}\n${emojis.roleplay_custom.bronze} | ${
              item.price.bronze
            }\n${emojis.roleplay_custom.silver} | ${item.price.silver}\n${
              emojis.roleplay_custom.gold
            } | ${item.price.gold}`,
            true,
          );
        });

        itemsToApear.weapons.forEach((a, i) => {
          const item = ctx.client.boleham.Functions.getItemById(a.id);
          selectMenu.addOptions({
            label: ctx.locale(`items:${a.id}.name`),
            value: `${a.id} ${a.level} ${i}`,
            description: ctx.locale(`items:${a.id}.description`),
          });
          embed.addField(
            `${ctx.locale(`items:${a.id}.name`)} | ${ctx.locale('common:level', {
              level: a.level,
            })}`,
            `${ctx.locale(`items:${a.id}.description`)}\n${emojis.roleplay_custom.bronze} | ${
              item.price.bronze
            }\n${emojis.roleplay_custom.silver} | ${item.price.silver}\n${
              emojis.roleplay_custom.gold
            } | ${item.price.gold}`,
            true,
          );
        });

        itemsToApear.potions.forEach((a, i) => {
          const item = ctx.client.boleham.Functions.getItemById(a.id);
          selectMenu.addOptions({
            label: ctx.locale(`items:${a.id}.name`),
            value: `${a.id} ${a.level} ${i}`,
            description: ctx.locale(`items:${a.id}.description`),
          });
          embed.addField(
            `${ctx.locale(`items:${a.id}.name`)} | ${ctx.locale('common:level', {
              level: a.level,
            })}`,
            `${ctx.locale(`items:${a.id}.description`)}\n${emojis.roleplay_custom.bronze} | ${
              item.price.bronze
            }\n${emojis.roleplay_custom.silver} | ${item.price.silver}\n${
              emojis.roleplay_custom.gold
            } | ${item.price.gold}`,
            true,
          );
        });

        ctx.editReply({
          embeds: [embed],
          components: [{ type: 'ACTION_ROW', components: [selectMenu] }],
        });
        break;
      }
      case 'BUY_CHOOSE': {
        if (!int.isSelectMenu()) break;
        let buyValue = {
          gold: 0,
          silver: 0,
          bronze: 0,
        };

        for (let i = 0; i < int.values.length; i++) {
          const [itemId, itemLevel] = int.values[i].split(' ');
          const { price } = ctx.client.boleham.Functions.getItemById(itemId);
          user.inventory = BasicFunctions.mergeInventory(user.inventory, {
            id: Number(itemId),
            level: Number(itemLevel),
          });

          buyValue = BasicFunctions.mergeCoins(buyValue, price, true);
        }
        user.money = BasicFunctions.mergeCoins(user.money, buyValue);
        if (!canBuy(user.money)) {
          ctx.editReply({
            embeds: [embed.spliceFields(0, 9).setDescription(ctx.locale('common:no-money'))],
          });
          return;
        }

        if (
          user.inventory.length >
          ctx.client.boleham.Functions.getBackPackLimit(user.equiped.backpack)
        ) {
          ctx.editReply({
            embeds: [embed.spliceFields(0, 9).setDescription(ctx.locale('common:backpack-full'))],
          });
          return;
        }

        await ctx.client.repositories.rpgRepository.editUser(ctx.author.id, {
          inventory: user.inventory,
          money: BasicFunctions.mergeCoins(user.money, buyValue),
        });

        ctx.editReply({
          content: ctx.locale('buildings:mart.buy-items', {
            items: int.values
              .map((a) => `${ctx.locale(`items:${a.split(' ')[0]}.name`)}`)
              .join(', '),
            money: buyValue,
          }),
          embeds: [],
        });

        collect.stop();
        break;
      }
      case 'SELECT': {
        if (!int.isSelectMenu()) break;

        let soldValue = {
          gold: 0,
          silver: 0,
          bronze: 0,
        };

        for (let i = 0; i < int.values.length; i++) {
          const [itemId, itemLevel] = int.values[i].split(' ');
          const { price } = ctx.client.boleham.Functions.getItemById(itemId);

          user.inventory = BasicFunctions.mergeInventory(
            user.inventory,
            { id: Number(itemId), level: Number(itemLevel) },
            true,
          );
          soldValue = BasicFunctions.mergeCoins(soldValue, price);
        }

        await ctx.client.repositories.rpgRepository.editUser(ctx.author.id, {
          inventory: user.inventory,
          money: BasicFunctions.mergeCoins(user.money, soldValue),
        });

        ctx.editReply({
          content: ctx.locale('buildings:mart.sell-items', {
            count: int.values.length,
            money: soldValue,
          }),
          embeds: [],
        });
        collect.stop();
        break;
      }
      case 'SELL': {
        let text = ctx.locale('buildings:mart.sell-base-text');

        if (user.inventory.length === 0) {
          ctx.editReply({ content: ctx.locale('common:no-itens-in-inventory') });
          return;
        }

        const createSelectMenu = () =>
          new MessageSelectMenu()
            .setCustomId(`${ctx.interaction.id} ${Date.now()} | SELECT`)
            .setPlaceholder(ctx.locale('common:select-all-values'))
            .setMinValues(1);

        let index = 0;

        const selectMenus: MessageSelectMenu[] = [createSelectMenu()];

        user.inventory.forEach((item) => {
          const { price } = ctx.client.boleham.Functions.getItemById(item.id);
          text += `${ctx.locale(`items:${item.id}.name`)} - ${emojis.roleplay_custom.bronze} **${
            price.bronze
          }**, ${emojis.roleplay_custom.silver} **${price.silver}**, ${
            emojis.roleplay_custom.gold
          } **${price.gold}** \n`;

          for (let i = 0; i < item.amount; i++) {
            if (selectMenus[index].options.length >= 25) {
              index += 1;
              selectMenus.push(createSelectMenu());
            }
            selectMenus[index].addOptions({
              label: ctx.locale(`items:${item.id}.name`),
              value: `${item.id} ${item.level ?? 0} ${i} ${index}`,
            });
          }
        });

        const componentsToSend: MessageActionRowOptions[] = selectMenus.map((a) => ({
          type: 'ACTION_ROW',
          components: [a],
        }));

        embed.setDescription(text);
        ctx.editReply({
          embeds: [embed],
          components: componentsToSend,
        });
        break;
      }
    }
  });
};
