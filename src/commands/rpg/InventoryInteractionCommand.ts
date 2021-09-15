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
import { AsAnUsableItem } from '@roleplay/Types';
import BasicFunctions from '@roleplay/Functions/BasicFunctions';

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
    const user = await this.client.repositories.rpgRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.replyL('error', 'common:not-registred', {}, true);
      return;
    }

    const setDefaultEmbed = () => {
      const embed = new MessageEmbed()
        .setTitle(ctx.translate('first.title', { user: ctx.author.username }))
        .setColor(ctx.data.user.cor)
        .setDescription(ctx.translate('first.description'))
        .addField(
          `${emojis.shield} | ${ctx.translate('armor')}`,
          `${ctx.locale('common:rpg.head')} - ${
            user.equiped.armor?.head
              ? `**${ctx.locale(`items:${user.equiped.armor.head.id}.name`)}** - ${ctx.locale(
                  'common:level',
                  { level: user.equiped.armor.head.level },
                )}`
              : ctx.translate('no-item')
          }\n${ctx.locale('common:rpg.chest')} - ${
            user.equiped.armor?.chest
              ? `**${ctx.locale(`items:${user.equiped.armor.chest.id}.name`)}** - ${ctx.locale(
                  'common:level',
                  { level: user.equiped.armor.chest.level },
                )}`
              : ctx.translate('no-item')
          }\n${ctx.locale('common:rpg.pants')} - ${
            user.equiped.armor?.pants
              ? `**${ctx.locale(`items:${user.equiped.armor.pants.id}.name`)}** - ${ctx.locale(
                  'common:level',
                  { level: user.equiped.armor.pants.level },
                )}`
              : ctx.translate('no-item')
          }\n${ctx.locale('common:rpg.boots')} - ${
            user.equiped.armor?.boots
              ? `**${ctx.locale(`items:${user.equiped.armor.boots.id}.name`)}** - ${ctx.locale(
                  'common:level',
                  { level: user.equiped.armor.boots.level },
                )}`
              : ctx.translate('no-item')
          }`,
          true,
        )
        .addField(
          `${emojis.sword} | ${ctx.translate('weapon')}`,
          `${
            user.equiped.weapon
              ? `**${ctx.locale(`items:${user.equiped.weapon.id}.name`)}** - ${ctx.locale(
                  'common:level',
                  { level: user.equiped.weapon.level },
                )}\n${ctx.locale(`items:${user.equiped.weapon.id}.description`)}`
              : ctx.translate('no-item')
          }`,
          true,
        )
        .addField(
          `${emojis.roleplay_custom.backpack} | ${ctx.translate('backpack')}`,
          `${
            user.equiped.backpack
              ? `**${ctx.locale(`items:${user.equiped.backpack.id}.name`)}** - ${ctx.locale(
                  'common:level',
                  {
                    level: user.equiped.backpack.level,
                  },
                )}\n${ctx.locale(`items:${user.equiped.backpack.id}.description`)}`
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
                `**${ctx.locale(`items:${a.id}.name`)}** - ${ctx.locale('common:level', {
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
            .map((a) => `**${ctx.locale(`items:${a.id}.name`)}** -  ${a.amount}`)
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
        ctx.author.id,
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
      int.customId.startsWith(ctx.interaction.id) && int.user.id === ctx.author.id;

    const collector = ctx.channel.createMessageComponentCollector({ filter, time: 10000, max: 5 });

    collector.on('collect', async (int) => {
      if (!int.isButton() && !int.isSelectMenu()) return;
      collector.resetTimer();

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
                const [newData, newInventory] = usePotion(
                  user,
                  item,
                  {
                    id: fromUserInventory.id,
                    level: fromUserInventory.level ?? 0,
                  },
                  ctx.client.boleham.Battle.getUserMaxLife(
                    user.classId,
                    user.level,
                    ctx.client.boleham.Battle.resolveArmor(user.equiped.armor),
                    user.equiped.weapon
                      ? ctx.client.boleham.Battle.resolveWeapon(user.equiped.weapon)
                      : null,
                  ),
                  ctx.client.boleham.Battle.getUserMaxMana(
                    user.classId,
                    user.level,
                    ctx.client.boleham.Battle.resolveArmor(user.equiped.armor),
                    user.equiped.weapon
                      ? ctx.client.boleham.Battle.resolveWeapon(user.equiped.weapon)
                      : null,
                  ),
                );
                if (item.helperType === 'mana') user.mana = newData;
                if (item.helperType === 'heal') user.life = newData;
                user.inventory = newInventory;
                break;
              }
              case 'weapon': {
                if (user.equiped.weapon)
                  user.inventory = BasicFunctions.mergeInventory(user.inventory, {
                    id: user.equiped.weapon.id,
                    level: user.equiped.weapon.level,
                  });

                user.equiped.weapon = {
                  id: fromUserInventory.id,
                  level: fromUserInventory.level ?? 0,
                };

                user.inventory = BasicFunctions.mergeInventory(
                  user.inventory,
                  {
                    id: fromUserInventory.id,
                    level: fromUserInventory.level ?? 0,
                  },
                  true,
                );
                break;
              }
              case 'backpack': {
                if (user.equiped.backpack)
                  user.inventory = BasicFunctions.mergeInventory(user.inventory, {
                    id: user.equiped.backpack.id,
                    level: user.equiped.backpack.level,
                  });

                user.equiped.backpack = {
                  id: fromUserInventory.id,
                  level: fromUserInventory.level ?? 0,
                };

                user.inventory = BasicFunctions.mergeInventory(
                  user.inventory,
                  {
                    id: fromUserInventory.id,
                    level: fromUserInventory.level ?? 0,
                  },
                  true,
                );
                break;
              }
              case 'armor': {
                switch (item.helperType) {
                  case 'head': {
                    if (user.equiped.armor.head)
                      user.inventory = BasicFunctions.mergeInventory(user.inventory, {
                        id: user.equiped.armor.head.id,
                        level: user.equiped.armor.head.level,
                      });

                    user.equiped.armor.head = {
                      id: fromUserInventory.id,
                      level: fromUserInventory.level ?? 0,
                    };

                    user.inventory = BasicFunctions.mergeInventory(
                      user.inventory,
                      {
                        id: fromUserInventory.id,
                        level: fromUserInventory.level ?? 0,
                      },
                      true,
                    );
                    break;
                  }
                  case 'chest': {
                    if (user.equiped.armor.chest)
                      user.inventory = BasicFunctions.mergeInventory(user.inventory, {
                        id: user.equiped.armor.chest.id,
                        level: user.equiped.armor.chest.level,
                      });

                    user.equiped.armor.chest = {
                      id: fromUserInventory.id,
                      level: fromUserInventory.level ?? 0,
                    };

                    user.inventory = BasicFunctions.mergeInventory(
                      user.inventory,
                      {
                        id: fromUserInventory.id,
                        level: fromUserInventory.level ?? 0,
                      },
                      true,
                    );
                    break;
                  }
                  case 'pants': {
                    if (user.equiped.armor.pants)
                      user.inventory = BasicFunctions.mergeInventory(user.inventory, {
                        id: user.equiped.armor.pants.id,
                        level: user.equiped.armor.pants.level,
                      });

                    user.equiped.armor.pants = {
                      id: fromUserInventory.id,
                      level: fromUserInventory.level ?? 0,
                    };

                    user.inventory = BasicFunctions.mergeInventory(
                      user.inventory,
                      {
                        id: fromUserInventory.id,
                        level: fromUserInventory.level ?? 0,
                      },
                      true,
                    );
                    break;
                  }
                  case 'boots': {
                    if (user.equiped.armor.boots)
                      user.inventory = BasicFunctions.mergeInventory(user.inventory, {
                        id: user.equiped.armor.boots.id,
                        level: user.equiped.armor.boots.level,
                      });

                    user.equiped.armor.boots = {
                      id: fromUserInventory.id,
                      level: fromUserInventory.level ?? 0,
                    };

                    user.inventory = BasicFunctions.mergeInventory(
                      user.inventory,
                      {
                        id: fromUserInventory.id,
                        level: fromUserInventory.level ?? 0,
                      },
                      true,
                    );
                    break;
                  }
                }
              }
            }
          });
          if (
            user.inventory.length >
            this.client.boleham.Functions.getBackPackLimit(user.equiped.backpack)
          ) {
            for (
              let i = user.inventory.length;
              i > this.client.boleham.Functions.getBackPackLimit(user.equiped.backpack);
              i--
            ) {
              user.inventory.pop();
            }
          }

          await this.client.repositories.rpgRepository.editUser(ctx.author.id, {
            life: user.life,
            mana: user.mana,
            equiped: user.equiped,
            inventory: user.inventory,
          });

          collector.stop();

          embed.setDescription(ctx.translate('third.changed', { count: int.values.length }));
          ctx.editReply({ content: '', embeds: [embed], components: [] });

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
                    `**${ctx.locale(`items:${a.id}.name`)}** - ${ctx.locale('common:level', {
                      level: a.level ?? 0,
                    })} | \`${a.amount}\``,
                )
                .join('\n'),
            );
          }

          if (clanOtherItems.length > 0) {
            embed.addField(
              ctx.translate('other'),
              clanOtherItems
                .map((a) => `**${ctx.locale(`items:${a.id}.name`)}** -  ${a.amount}`)
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
                    label: ctx.locale(`items:${a.id}.name`),
                    value: `${a.id} ${a.level ?? 0} ${i}`,
                  });
                  return `**${ctx.locale(`items:${a.id}.name`)}** - ${ctx.locale('common:level', {
                    level: a.level ?? 0,
                  })} | \`${a.amount}\``;
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
