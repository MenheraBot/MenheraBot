import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import {
  MessageActionRowOptions,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import BasicFunctions from '@roleplay/BasicFunctions';
import { IBuildingFile, IRpgUserSchema } from '@roleplay/Types';

const buildings: { [key: number]: IBuildingFile } = {
  0: {
    name: 'mart',
    locationId: 0,
    execute: async (ctx: InteractionCommandContext, user: IRpgUserSchema) => {
      const embed = new MessageEmbed()
        .setTitle(ctx.locale('roleplay:mart.embed-title'))
        .setColor(ctx.data.user.cor)
        .setDescription(ctx.locale('roleplay:mart.embed-description'));

      const sellButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | SELL`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('roleplay:mart.sell'));

      const buyButton = new MessageButton()
        .setCustomId(`${ctx.interaction.id} | BUY`)
        .setStyle('PRIMARY')
        .setLabel(ctx.locale('roleplay:mart.buy'));

      ctx.editReply({
        embeds: [embed],
        components: [{ type: 'ACTION_ROW', components: [sellButton, buyButton] }],
      });

      const filter = (int: MessageComponentInteraction) =>
        int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.interaction.user.id;

      const collect = ctx.channel.createMessageComponentCollector({ filter, max: 10, time: 15000 });

      collect.on('end', () => {
        ctx.editReply({
          components: [
            {
              type: 'ACTION_ROW',
              components: [sellButton.setLabel(ctx.locale('common:timesup')).setDisabled(true)],
            },
          ],
        });
      });

      collect.on('collect', (int) => {
        collect.resetTimer({ time: 20000 });
        int.deferUpdate();
        switch (int.customId.replace(`${ctx.interaction.id} | `, '')) {
          case 'BUY':
            ctx.editReply({ embeds: [embed.setDescription('COMPRANDO')] });
            break;
          case 'SELECT': {
            if (!int.isSelectMenu()) break;
            let soldValue = {
              gold: 0,
              silver: 0,
              bronze: 0,
            };
            for (let i = 0; i < int.values.length; i++) {
              const found = user.inventory.findIndex((a) => a.id === Number(int.values[i]));
              if (found !== -1) user.inventory[found].amount -= 1;
              if (user.inventory[found].amount <= 0) user.inventory.splice(found, 1);
              const { price } = ctx.client.boleham.Functions.getItemById(int.values[i]);
              soldValue = BasicFunctions.mergeCoins(soldValue, price);
            }
            break;
          }
          case 'SELL': {
            let text = ctx.locale('roleplay:mart.sell-base-text');

            const createSelectMenu = () =>
              new MessageSelectMenu()
                .setCustomId(`${ctx.interaction.id} | SELECT`)
                .setPlaceholder(ctx.locale('common:select-all-values'))
                .setMinValues(1);

            let index = 0;

            const selectMenus: MessageSelectMenu[] = [createSelectMenu()];

            user.inventory.forEach((item) => {
              const { price } = ctx.client.boleham.Functions.getItemById(item.id);
              text += `${ctx.locale(`roleplay:items.${item.id}.name`)} - ${
                emojis.roleplay_custom.bronze
              } **${price.bronze}**, ${emojis.roleplay_custom.silver} **${price.silver}**, ${
                emojis.roleplay_custom.gold
              } **${price.gold}** \n`;

              for (let i = 0; i < item.amount; i++) {
                if (selectMenus[index].options.length >= 25) {
                  index += 1;
                  selectMenus.push(createSelectMenu());
                }
                selectMenus[index].addOptions({
                  label: ctx.locale(`roleplay:items.${item.id}.name`),
                  value: `${item.id} ${i} ${index}`,
                });
              }
            });

            const componentsToSend: MessageActionRowOptions[] = selectMenus.map((a) => ({
              type: 'ACTION_ROW',
              components: [a],
            }));

            console.log(componentsToSend[0].components);

            embed.setDescription(text);
            ctx.editReply({
              embeds: [embed],
              components: componentsToSend,
            });
            break;
          }
        }
      });
    },
  },
};

export default buildings;
