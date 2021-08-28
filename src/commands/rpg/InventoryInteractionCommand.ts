import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import {
  MessageActionRowOptions,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import { emojis } from '@structures/MenheraConstants';
import { resolveCustomId, usePotion } from '@roleplay/Utils';
import { AsAnUsableItem } from '@structures/roleplay/Types';

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

    const setDefaultEmbed = () => {
      const embed = new MessageEmbed()
        .setTitle(ctx.translate('first.title', { user: ctx.interaction.user.username }))
        .setColor(ctx.data.user.cor)
        .setDescription(ctx.translate('first.description'))
        .addField(
          `${emojis.shield} | ${ctx.translate('armor')}`,
          `${ctx.locale('common:rpg.head')} - ${
            user.equiped.armor?.head
              ? `**${ctx.locale(
                  `roleplay:items.${user.equiped.armor.head.id}.name`,
                )}** - ${ctx.locale('common:level', { level: user.equiped.armor.head.level })}`
              : ctx.translate('no-item')
          }\n${ctx.locale('common:rpg.chest')} - ${
            user.equiped.armor?.chest
              ? `**${ctx.locale(
                  `roleplay:items.${user.equiped.armor.chest.id}.name`,
                )}** - ${ctx.locale('common:level', { level: user.equiped.armor.chest.level })}`
              : ctx.translate('no-item')
          }\n${ctx.locale('common:rpg.pants')} - ${
            user.equiped.armor?.pants
              ? `**${ctx.locale(
                  `roleplay:items.${user.equiped.armor.pants.id}.name`,
                )}** - ${ctx.locale('common:level', { level: user.equiped.armor.pants.level })}`
              : ctx.translate('no-item')
          }\n${ctx.locale('common:rpg.boots')} - ${
            user.equiped.armor?.boots
              ? `**${ctx.locale(
                  `roleplay:items.${user.equiped.armor.boots.id}.name`,
                )}** - ${ctx.locale('common:level', { level: user.equiped.armor.boots.level })}`
              : ctx.translate('no-item')
          }`,
          true,
        )
        .addField(
          `${emojis.sword} | ${ctx.translate('weapon')}`,
          `${
            user.equiped.weapon
              ? `**${ctx.locale(`roleplay:items.${user.equiped.weapon.id}.name`)}** - ${ctx.locale(
                  'common:level',
                  { level: user.equiped.weapon.level },
                )}\n${ctx.locale(`roleplay:items.${user.equiped.weapon.id}.description`)}`
              : ctx.translate('no-item')
          }`,
          true,
        )
        .addField(
          `${emojis.roleplay_custom.backpack} | ${ctx.translate('backpack')}`,
          `${
            user.equiped.backpack
              ? `**${ctx.locale(
                  `roleplay:items.${user.equiped.backpack.id}.name`,
                )}** - ${ctx.locale('common:level', {
                  level: user.equiped.backpack.level,
                })}\n${ctx.locale(`roleplay:items.${user.equiped.backpack.id}.description`)}`
              : ctx.translate('no-item')
          }`,
          true,
        );

      const usableItems = user.inventory.filter((a) => a.level);
      const otherItems = user.inventory.filter((a) => typeof a.level === 'undefined');

      if (usableItems.length > 0) {
        embed.addField(
          ctx.translate('usable'),
          usableItems
            .map(
              (a) =>
                `**${ctx.locale(`roleplay:items.${a.id}.name`)}** - ${ctx.locale('common:level', {
                  level: a.level ?? 0,
                })} | \`${a.amount}\``,
            )
            .join('\n'),
        );
      }

      if (otherItems.length > 0) {
        embed.addField(
          ctx.translate('other'),
          otherItems
            .map((a) => `**${ctx.locale(`roleplay:items.${a.id}.name`)}** -  ${a.amount}`)
            .join('\n'),
        );
      }

      return embed;
    };

    const embed = setDefaultEmbed();

    const selector = new MessageSelectMenu()
      .setPlaceholder(ctx.translate('select-home'))
      .setCustomId(`${ctx.interaction.id} | HOME`)
      .setMaxValues(1)
      .setMinValues(1);

    const button = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | INVENTORY`)
      .setLabel(ctx.locale('common:use-item'))
      .setStyle('PRIMARY');

    if (user.inventory.filter((a) => a.level).length === 0) button.setDisabled(true);

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

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.interaction.user.id;

    const collector = ctx.channel.createMessageComponentCollector({ filter, time: 10000, max: 5 });

    collector.on('collect', async (int) => {
      if (!int.isButton() && !int.isSelectMenu()) return;

      switch (resolveCustomId(int.customId)) {
        case 'CHANGE': {
          if (!int.isSelectMenu()) return;
          int.values.forEach((a) => {
            const item = this.client.boleham.Functions.getItemById<AsAnUsableItem>(a.split(' ')[0]);
            const fromUserInventory = user.inventory.filter(
              (itm) => `${itm.id}` === a && `${itm.level}` === a.split(' ')[1],
            )[0];
            switch (item.type) {
              case 'potion': {
                const [newData, newInventory] = usePotion(user, item, {
                  id: fromUserInventory.id,
                  level: fromUserInventory.level ?? 0,
                });
                if (item.helperType === 'mana') user.mana = newData;
                if (item.helperType === 'heal') user.life = newData;
                user.inventory = newInventory;
                break;
              }
            }
          });

          break;
        }
        case 'HOME': {
          if (!int.isSelectMenu()) return;
          const selectedHome = await this.client.repositories.homeRepository.getHomeById(
            int.values[0],
          );
          if (!selectedHome) {
            ctx.editReply({ content: ctx.translate('no-home') });
            return;
          }
          embed.setTitle(ctx.translate('second.description', { name: selectedHome.name }));

          const clanUsableItems = selectedHome.inventory.filter((a) => a.level);
          const clanOtherItems = selectedHome.inventory.filter(
            (a) => typeof a.level === 'undefined',
          );

          if (clanUsableItems.length > 0) {
            embed.addField(
              ctx.translate('usable'),
              clanUsableItems
                .map(
                  (a) =>
                    `**${ctx.locale(`roleplay:items.${a.id}.name`)}** - ${ctx.locale(
                      'common:level',
                      {
                        level: a.level ?? 0,
                      },
                    )} | \`${a.amount}\``,
                )
                .join('\n'),
            );
          }

          if (clanOtherItems.length > 0) {
            embed.addField(
              ctx.translate('other'),
              clanOtherItems
                .map((a) => `**${ctx.locale(`roleplay:items.${a.id}.name`)}** -  ${a.amount}`)
                .join('\n'),
            );
          }

          ctx.editReply({ embeds: [embed] });
          break;
        }
        case 'INVENTORY': {
          embed.setDescription(ctx.translate('third.description'));

          const usableItems = user.inventory.filter((a) => a.level);

          const itensSelect = new MessageSelectMenu()
            .setCustomId(`${ctx.interaction.id} | CHANGE`)
            .setPlaceholder(ctx.locale('common:select-all-values'))
            .setMinValues(1);

          if (usableItems.length > 0) {
            embed.addField(
              ctx.translate('usable'),
              usableItems
                .map((a, i) => {
                  itensSelect.addOptions({
                    label: ctx.locale(`roleplay:items.${a.id}.name`),
                    value: `${a.id} ${a.level ?? 0} ${i}`,
                  });
                  return `**${ctx.locale(`roleplay:items.${a.id}.name`)}** - ${ctx.locale(
                    'common:level',
                    {
                      level: a.level ?? 0,
                    },
                  )} | \`${a.amount}\``;
                })
                .join('\n'),
            );
          }

          ctx.editReply({
            embeds: [embed],
            components: [{ type: 'ACTION_ROW', components: [itensSelect] }],
          });
          break;
        }
      }
    });
  }
}
