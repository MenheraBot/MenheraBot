import { DropItem, RoleplayUserSchema } from '@roleplay/Types';
import { removeFromInventory } from '@roleplay/utils/AdventureUtils';
import { getItemById } from '@roleplay/utils/DataUtils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import Util, { actionRow, disableComponents, resolveSeparatedStrings } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';

export default class GuildaInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'guilda',
      description: '【ＲＰＧ】Entre na guilda de Boleham',
      category: 'roleplay',
      options: [
        {
          name: 'cômodo',
          description: 'Para que vieste à guilda?',
          type: 'STRING',
          required: true,
          choices: [
            { name: 'Venda de Itens', value: 'sell' },
            { name: 'Compra de Ferramentas', value: 'buy' },
            { name: 'Mural de Quests', value: 'quest' },
          ],
        },
      ],
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const option = ctx.options.getString('cômodo', true);

    if (option === 'quest') {
      ctx.makeMessage({ content: ctx.prettyResponse('wink', 'common:soon'), ephemeral: true });
      return;
    }

    if (option === 'buy') {
      ctx.makeMessage({ content: ctx.prettyResponse('wink', 'common:soon'), ephemeral: true });
      return;
    }

    if (option === 'sell') return GuildaInteractionCommand.sellItems(ctx, user);
  }

  static async sellItems(ctx: InteractionCommandContext, user: RoleplayUserSchema): Promise<void> {
    if (user.inventory.length === 0) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:guilda.sell.no-items') });
      return;
    }

    const sellableItems = user.inventory.filter(
      (a) => getItemById(a.id).data.type === 'enemy_drop',
    );

    if (sellableItems.length === 0) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:guilda.sell.no-items') });
      return;
    }

    const selectMenu = new MessageSelectMenu().setCustomId(`${ctx.interaction.id} | SELL`);

    const embed = new MessageEmbed()
      .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }))
      .setTitle(ctx.locale('commands:guilda.title'))
      .setColor(ctx.data.user.selectedColor);

    sellableItems.forEach((a, i) => {
      const resolvedItem = getItemById<DropItem>(a.id);
      if (embed.fields.length >= 25) return;
      embed.addField(
        ctx.locale(`items:${a.id as 1}.name`),
        `${ctx.locale('common:roleplay.level')} **${a.level}**\n${ctx.locale('common:amount')}: **${
          a.amount
        }**\n${ctx.locale('common:value')}: **${
          resolvedItem.data.marketValue + resolvedItem.data.perLevel * a.level
        }**`,
        true,
      );

      for (let j = 0; j < a.amount; j++) {
        if (selectMenu.options.length >= 25) break;
        selectMenu.addOptions({
          label: `${ctx.locale(`items:${a.id as 1}.name`)} | ${ctx.locale(
            'common:roleplay.level',
          )} ${a.level}`,
          value: `${a.id} | ${a.level} | ${
            resolvedItem.data.marketValue + resolvedItem.data.perLevel * a.level
          } | ${i} | ${j}`,
        });
      }
    });

    selectMenu.setMaxValues(selectMenu.options.length).setMinValues(1);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([selectMenu])] });

    const selectedItems =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        15000,
      );

    if (!selectedItems) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [selectMenu]))],
      });
      return;
    }

    const itemsSelected = selectedItems.values.map((a) => ({
      value: Number(resolveSeparatedStrings(a)[2]),
      item: getItemById<DropItem>(Number(resolveSeparatedStrings(a)[0])),
      level: Number(resolveSeparatedStrings(a)[1]),
    }));

    const itemValues = itemsSelected.reduce((p, c) => p + c.value, 0);

    user.money += itemValues;
    removeFromInventory(
      itemsSelected.map((a) => ({ id: a.item.id, level: a.level })),
      user.inventory,
    );

    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      money: user.money,
      inventory: user.inventory,
    });

    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'commands:guilda.sell.success', { value: itemValues }),
      components: [],
      embeds: [],
    });
  }
}
