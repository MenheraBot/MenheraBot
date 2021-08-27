import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  MessageActionRowOptions,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import { emojis } from '@structures/MenheraConstants';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'inventario',
      description:
        '【ＲＰＧ】Veja o inventário de seu personagem, de suas casas, e tome ações diante deles',
      category: 'rpg',
      cooldown: 8,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.findUser(ctx.interaction.user.id);
    if (!user) {
      ctx.replyT('error', 'common:not-registred');
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.translate('first.title', { user: ctx.interaction.user.username }))
      .setColor(ctx.data.user.cor)
      .setDescription(ctx.translate('first.description'))
      .addField(
        ctx.translate('usables'),
        `**${ctx.translate('armor')}:**\n${ctx.locale('common:rpg.head')} - ${
          user.equiped.armor?.boots
            ? `${ctx.locale(`roleplay:items.${user.equiped.armor.boots.id}`)} - ${ctx.locale(
                'common.level',
                { level: user.equiped.armor.boots.level },
              )}`
            : ctx.translate('no-item')
        }`,
      );

    const selector = new MessageSelectMenu()
      .setPlaceholder(ctx.translate('select-home'))
      .setCustomId(`${ctx.interaction.id} | HOME`)
      .setMaxValues(1)
      .setMinValues(1);

    const button = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | INVENTORY`)
      .setLabel(ctx.locale('common:use-item'))
      .setStyle('PRIMARY');

    if (user.homes.length > 0) {
      const AllUserHomes = await this.client.repositories.homeRepository.getAllUserHomes(
        ctx.interaction.user.id,
      );

      selector.addOptions(
        AllUserHomes.map((a) => ({
          label: ctx.locale('common:home-in', {
            location: ctx.locale(`roleplay:locations.${a.locationId}.name`),
          }),
          value: a._id,
          emoji: emojis.home,
        })),
      );
    }

    const components: MessageActionRowOptions[] =
      selector.options.length === 0
        ? [{ type: 'ACTION_ROW', components: [button] }]
        : [
            { type: 'ACTION_ROW', components: [button] },
            { type: 'ACTION_ROW', components: [selector] },
          ];

    ctx.reply({ embeds: [embed], components });
  }
}
