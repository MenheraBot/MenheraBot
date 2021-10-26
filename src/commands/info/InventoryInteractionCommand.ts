import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  MessageEmbed,
  MessageButton,
  ButtonInteraction,
  SelectMenuInteraction,
  MessageSelectMenu,
  MessageSelectOptionData,
} from 'discord.js-light';
import Util, { actionRow, disableComponents } from '@utils/Util';

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

    const canUseItems = !(
      user.inventory.length === 0 ||
      user.inventory.every((a) => user.inUseItems.some((b) => b.id === a.id && b.level === a.level))
    );

    if (!canUseItems) useItemButton.setDisabled(true);

    await ctx.makeMessage({
      embeds: [embed.setFooter(ctx.translate('use-footer'))],
      components: [actionRow([useItemButton])],
    });

    if (!canUseItems) return;

    const collected = await Util.collectComponentInteractionWithId<ButtonInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7000,
    );

    if (!collected) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [useItemButton]))],
      });
      return;
    }

    const availableItems = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | USE`)
      .setPlaceholder(ctx.translate('select'))
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        user.inventory.reduce<MessageSelectOptionData[]>((p, c) => {
          if (user.inUseItems.some((a) => a.id === c.id && a.level === c.level)) return p;

          p.push({
            label: ctx.locale(`data:magic-items.${c.id}.name`),
            value: `${c.id} | ${c.level}`,
          });
          return p;
        }, []),
      );

    embed.setDescription(ctx.translate('choose-item'));

    ctx.makeMessage({ embeds: [embed], components: [actionRow([availableItems])] });

    const selectedItem =
      await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        7000,
      );

    if (!selectedItem) {
      ctx.makeMessage({
        components: [actionRow(disableComponents(ctx.locale('common:timesup'), [availableItems]))],
      });
      return;
    }

    if (user.itemsLimit < user.inUseItems.length) {
      // TO DO: Remove a count in user inventory adn add to inUseItems, if necessary, split from inventory
      user.inUseItems.push();
    }
    console.log('');
  }
}
