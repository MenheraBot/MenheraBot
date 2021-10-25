/* eslint-disable no-unused-expressions */
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed, MessageButton, ButtonInteraction } from 'discord.js-light';
import Util, { disableComponents } from '@utils/Util';

export default class InventoryInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'inventario',
      description: '「📂」・Abre o inventário de alguém',
      category: 'info',
      options: [
        {
          name: 'user',
          type: 'USER',
          description: 'Usuário para abrir o inventário',
          required: false,
        },
      ],
      cooldown: 7,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user =
      ctx.options.getUser('user') && ctx.options.getUser('user', true).id !== ctx.author.id
        ? await this.client.repositories.userRepository.find(ctx.options.getUser('user', true).id)
        : ctx.data.user;

    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'no-user'),
        ephemeral: true,
      });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(
        ctx.translate('title', {
          user: ctx.options.getUser('user')?.username ?? ctx.author.username,
        }),
      )
      .setColor(user.cor);

    if (user.inventory.length === 0 && user.inUseItems.length === 0) {
      embed.setDescription(ctx.prettyResponse('error', 'no-item'));
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    embed.addField(
      ctx.translate('items'),
      user.inventory.length > 0
        ? user.inventory.reduce(
            (p, c) =>
              `${p}**${ctx.locale('common:name')}:** ${ctx.locale(
                `data:magic-items.${c.id}.name`,
              )}\n**${ctx.locale('common:level')}**: ${c.level}\n**${ctx.locale(
                'common:amount',
              )}**: ${c.amount}\n`,
            '',
          )
        : ctx.translate('no-item'),
      true,
    );

    embed.addField(
      ctx.translate('active'),
      user.inUseItems.length > 0
        ? user.inUseItems.reduce(
            (p, c) =>
              `${p}**${ctx.locale('common:name')}:** ${ctx.locale(
                `data:magic-items.${c.id}.name`,
              )}\n**${ctx.locale('common:level')}**: ${c.level}\n**${ctx.locale(
                'common:description',
              )}**: ${ctx.locale(`data:magic-items.${c.id}.description`)}\n`,
            '',
          )
        : ctx.translate('no-item'),
      true,
    );

    if (user.id !== ctx.author.id) {
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const useItemButton = new MessageButton()
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.translate('use'))
      .setStyle('PRIMARY');

    await ctx.makeMessage({
      embeds: [embed],
      components: [{ type: 'ACTION_ROW', components: [useItemButton] }],
    });

    const collected = await Util.collectComponentInteractionWithId<ButtonInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7000,
    );

    if (!collected) {
      ctx.makeMessage({
        components: [
          {
            type: 'ACTION_ROW',
            components: disableComponents(ctx.locale('common:timesup'), [useItemButton]),
          },
        ],
      });
      return;
    }

    console.log('a');
  }
}
