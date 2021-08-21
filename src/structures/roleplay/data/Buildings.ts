import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis } from '@structures/MenheraConstants';
import {
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import { IBuildingFile, IRpgUserSchema } from '../Types';

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

      const allMessageCompontents: MessageButton[] | MessageSelectMenu[] = [sellButton, buyButton];

      ctx.editReply({
        embeds: [embed],
        components: [{ type: 'ACTION_ROW', components: allMessageCompontents }],
      });

      const filter = (int: MessageComponentInteraction) =>
        int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.interaction.user.id;

      const collect = ctx.channel.createMessageComponentCollector({ filter, max: 10, time: 15000 });

      collect.on('end', () => {
        ctx.editReply({
          components: [
            {
              type: 'ACTION_ROW',
              components: allMessageCompontents.map((a: MessageButton | MessageSelectMenu) => {
                if (a instanceof MessageButton)
                  return a.setLabel(ctx.locale('common:timesup')).setDisabled(true);
                return a.setPlaceholder(ctx.locale('common:timesup')).setDisabled(true);
              }),
            },
          ],
        });
      });

      collect.on('collect', (int) => {
        int.deferUpdate();
        if (int.isButton()) {
          switch (int.customId.replace(`${ctx.interaction.id} | `, '')) {
            case 'BUY':
              ctx.editReply({ embeds: [embed.setDescription('COMPRANDO')] });
              break;
            case 'SELL': {
              let text = ctx.locale('roleplay:mart.sell-base-text');
              user.inventory.forEach((item) => {
                const { price } = ctx.client.boleham.Functions.getItemById(item.id);
                text += `${ctx.locale(`roleplay:items.${item.id}.name`)} - ${
                  emojis.roleplay_custom.bronze
                } **${price.bronze}**, ${emojis.roleplay_custom.silver} **${price.silver}**, ${
                  emojis.roleplay_custom.gold
                } **${price.gold}** \n`;
              });

              embed.setDescription(text);
              break;
            }
          }
        }
      });
    },
  },
};

export default buildings;
