/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  LAST_DUNGEON_LEVEL,
  MOB_LIMIT_PER_DUNGEON_LEVEL,
  ROLEPLAY_COOLDOWNS,
} from '@roleplay/Constants';
import {
  ConsumableItem,
  InventoryItem,
  RoleplayUserSchema,
  UserBattleEntity,
} from '@roleplay/Types';
import {
  canUsersGoToDungeon,
  getDungeonEnemies,
  prepareUserForDungeon,
  getEnemiesLoots,
  getFreeInventorySpace,
  isInventoryFull,
  makeCooldown,
  makeLevelUp,
  removeFromInventory,
  getUsersLoots,
  addToInventory,
} from '@roleplay/utils/AdventureUtils';
import { isDead } from '@roleplay/utils/BattleUtils';
import {
  getUserAgility,
  getUserArmor,
  getUserChurchStatus,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
  getUserMaxMana,
} from '@roleplay/utils/Calculations';
import { getEquipmentById, getItemById } from '@roleplay/utils/DataUtils';
import RoleplayBattle, { BattleDiscordUser } from '@roleplay/structures/PlayerVsEntity';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

import { COLORS, emojis } from '@structures/Constants';

import {
  actionRow,
  debugError,
  makeCustomId,
  resolveCustomId,
  resolveSeparatedStrings,
} from '@utils/Util';

import {
  MessageButton,
  MessageEmbed,
  MessageComponentInteraction,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

export default class DungeonCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'dungeon',
      description: '【ＲＰＧ】🦇 | Vá em uma aventura na Dungeon',
      descriptionLocalizations: { 'en-US': '【ＲＰＧ】🦇 | Go on a Dungeon Adventure' },
      category: 'roleplay',
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const authorUser = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);

    if (!authorUser) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'common:unregistered'),
        ephemeral: true,
      });
      return;
    }

    const userParty = await ctx.client.repositories.roleplayRepository.getUserParty(authorUser.id);

    const toBattleUsers = userParty
      ? ((await Promise.all(
          userParty.users
            .filter((b) => b !== ctx.author.id)
            .map((a) => ctx.client.repositories.roleplayRepository.findUser(a)),
        )) as RoleplayUserSchema[])
      : [];

    toBattleUsers.push(authorUser);

    if (toBattleUsers.some((a) => !a)) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:dungeon.preparation.no_party_members'),
      });
      return;
    }

    if (userParty)
      toBattleUsers.sort((a, b) =>
        a.id === userParty.ownerId ? -1 : b.id === userParty.ownerId ? 1 : 0,
      );

    const canUsersGo = canUsersGoToDungeon(toBattleUsers, ctx);

    if (!canUsersGo.canGo) {
      const embed = new MessageEmbed()
        .setColor('DARK_RED')
        .setFields(canUsersGo.reason)
        .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }));
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('hourglass', 'commands:dungeon.preparation.title'))
      .setFooter({
        text: ctx.locale('commands:dungeon.preparation.footer', {
          users: 0,
          maxUsers: toBattleUsers.length,
        }),
      })
      .setColor('#e3beff')
      .addFields(
        toBattleUsers.map((user) => ({
          name: ctx.locale('commands:dungeon.preparation.stats', {
            user: ctx.client.users.cache.get(user.id)?.username ?? `ID: ${user.id}`,
          }),
          value: ctx.locale('commands:dungeon.preparation.stats-description', {
            emojis,
            life: user.life,
            maxLife: getUserMaxLife(user),
            mana: user.mana,
            maxMana: getUserMaxMana(user),
            armor: getUserArmor(prepareUserForDungeon(user)),
            damage: getUserDamage(prepareUserForDungeon(user)),
            intelligence: getUserIntelligence(prepareUserForDungeon(user)),
            agility: getUserAgility(prepareUserForDungeon(user)),
            maxCapacity: getEquipmentById(user.backpack.id).data.levels[user.backpack.level].value,
            capacity:
              getEquipmentById(user.backpack.id).data.levels[user.backpack.level].value -
              getFreeInventorySpace(user),
          }),
          inline: true,
        })),
      );

    const [acceptCustomId, baseId] = makeCustomId('ACCEPT');
    const [negateCustomId] = makeCustomId('NEGATE', baseId);

    const accept = new MessageButton()
      .setCustomId(acceptCustomId)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('commands:dungeon.preparation.enter'));

    const negate = new MessageButton()
      .setCustomId(negateCustomId)
      .setStyle('DANGER')
      .setLabel(ctx.locale('commands:dungeon.preparation.no'));

    await ctx.makeMessage({
      content: toBattleUsers.map((a) => `<@${a.id}>`).join(', '),
      embeds: [embed],
      components: [actionRow([accept, negate])],
    });

    const filter = (int: MessageComponentInteraction) =>
      int.customId.startsWith(`${baseId}`) && toBattleUsers.some((a) => a.id === int.user.id);

    const collector = ctx.channel.createMessageComponentCollector({ idle: 15_000, filter });

    const acceptedIds: string[] = [];

    collector.on('end', (_, reason) => {
      if (reason !== 'idle') return;

      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'common:timesup'),
      });
    });

    collector.on('collect', async (int: MessageComponentInteraction) => {
      int.deferUpdate();
      if (resolveCustomId(int.customId) === 'NEGATE') {
        collector.stop();
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:dungeon.arregou', {
            user: int.user.username,
          }),
          embeds: [],
          components: [],
        });
        return;
      }

      if (acceptedIds.includes(int.user.id)) return;
      acceptedIds.push(int.user.id);

      if (acceptedIds.length !== toBattleUsers.length) {
        ctx.makeMessage({
          embeds: [
            embed.setFooter({
              text: ctx.locale('commands:dungeon.preparation.footer', {
                users: acceptedIds.length,
                maxUsers: toBattleUsers.length,
              }),
            }),
          ],
        });
        return;
      }

      collector.stop();
      return DungeonCommand.DungeonLoop(
        ctx,
        toBattleUsers.map((a) => prepareUserForDungeon(a)),
        // TODO: Mob lebel system
        1,
        0,
      );
    });
  }

  static async DungeonLoop(
    ctx: InteractionCommandContext,
    users: UserBattleEntity[],
    dungeonLevel: number,
    killedMobs: number,
  ): Promise<void> {
    // TODO: better way to get enemies
    const enemies = getDungeonEnemies(dungeonLevel, users[0].level);

    const discordBattleUsers: BattleDiscordUser[] = users.map((a) => {
      const fromCache = ctx.client.users.cache.get(a.id);

      return {
        id: a.id,
        username: fromCache?.username ?? `ID: ${a.id}`,
        imageUrl:
          fromCache?.displayAvatarURL({ dynamic: true }) ?? ctx.client.user.displayAvatarURL(),
      };
    });

    const battleResults = await new RoleplayBattle(
      users,
      enemies,
      discordBattleUsers,
      ctx,
      ctx.locale('roleplay:battle.find', {
        enemy: ctx.locale(`enemies:${enemies[0].id as 1}.name`),
        amount: enemies.length,
        level: enemies[0].level + 1,
      }),
    ).battleLoop();

    if (battleResults.users.every((u) => isDead(u))) {
      battleResults.users.forEach((user) => {
        const { prayMinutesToMaxStatus } = getUserChurchStatus(user);

        makeCooldown(user.cooldowns, {
          reason: 'church',
          until: prayMinutesToMaxStatus * 60000 + Date.now() + ROLEPLAY_COOLDOWNS.deathPunishment,
          data: 'DEATH',
        });

        user.life = getUserMaxLife(user);
        user.mana = getUserMaxMana(user);

        ctx.client.repositories.roleplayRepository.postBattle(user.id, user);
      });

      ctx.makeMessage({
        content: ctx.prettyResponse('cross', 'commands:dungeon.results.everyone-dead'),
        embeds: [],
        components: [],
      });
      return;
    }

    const resultEmbed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('crown', 'commands:dungeon.results.title'))
      .setColor(COLORS.Purple);

    battleResults.users.forEach((user, i) => {
      if (battleResults.didRunaway)
        makeCooldown(user.cooldowns, {
          reason: 'dungeon',
          until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
        });

      const deadEnemies = battleResults.enemies.filter((a) => isDead(a)).length;

      if (!isDead(user) && user.didParticipate && deadEnemies > 0) {
        user.experience += deadEnemies * battleResults.enemies[0].experience;

        const oldUserLevel = user.level;

        if (oldUserLevel < 22) makeLevelUp(user);

        if (user.level > oldUserLevel) {
          user.life = getUserMaxLife(user);
          user.mana = getUserMaxMana(user);

          ctx.send({
            content: ctx.prettyResponse('level', 'common:roleplay.level-up', {
              level: user.level,
            }),
            ephemeral: true,
          });
        }
      }

      resultEmbed.addField(
        ctx.locale('commands:dungeon.preparation.stats', {
          user: battleResults.discordUsers[i].username,
        }),
        ctx.locale('commands:dungeon.results.stats-description', {
          emojis,
          life: user.life,
          mana: user.mana,
          maxLife: getUserMaxLife(user),
          maxMana: getUserMaxMana(user),
          maxCapacity: getEquipmentById(user.backpack.id).data.levels[user.backpack.level].value,
          capacity:
            getEquipmentById(user.backpack.id).data.levels[user.backpack.level].value -
            getFreeInventorySpace(user),
          experience: battleResults.didRunaway
            ? 0
            : battleResults.enemies.filter((a) => isDead(a)).length *
              battleResults.enemies[0].experience,
        }),
        true,
      );
    });

    if (battleResults.didRunaway) {
      battleResults.users.forEach((user) =>
        ctx.client.repositories.roleplayRepository.postBattle(user.id, user),
      );

      resultEmbed
        .setDescription(ctx.locale('commands:dungeon.results.runaway'))
        .setColor(COLORS.Colorless);
      ctx.makeMessage({ embeds: [resultEmbed], components: [], content: null });
      return;
    }

    resultEmbed
      .setDescription(
        ctx.locale('commands:dungeon.results.finish', {
          amount: enemies.length,
          enemy: ctx.locale(`enemies:${enemies[0].id as 1}.name`),
        }),
      )
      .setFooter({
        text: ctx.locale('commands:dungeon.results.footer', {
          users: 0,
          maxUsers: battleResults.users.length,
        }),
      });

    const availableLoots = getEnemiesLoots(enemies.map((a) => a.loots));

    const [, baseId] = makeCustomId('');

    const usePotionButton = new MessageButton()
      .setCustomId(makeCustomId('USE_POTION', baseId)[0])
      .setLabel(ctx.locale('commands:inventario.use-potion'))
      .setStyle('PRIMARY')
      .setDisabled(
        !battleResults.users.some((user) =>
          user.inventory.some((a) => getItemById(a.id).data.type === 'potion'),
        ),
      );

    const takeItemsButton = new MessageButton()
      .setCustomId(makeCustomId('PICK_ITEMS', baseId)[0])
      .setLabel(ctx.locale('commands:dungeon.results.pick-loots'))
      .setStyle('PRIMARY')
      .setDisabled(
        battleResults.users.every((a) => isInventoryFull(a) || availableLoots.length === 0),
      );

    const readyButton = new MessageButton()
      .setCustomId(makeCustomId('READY', baseId)[0])
      .setLabel(ctx.locale('commands:arena.ready'))
      .setStyle('PRIMARY');

    resultEmbed.addField(
      ctx.locale('commands:dungeon.results.available-items'),
      availableLoots.length === 0
        ? ctx.locale('commands:dungeon.results.no-items')
        : availableLoots
            .reduce<InventoryItem[]>((acc, item) => {
              const find = acc.find((a) => a.id === item);
              if (find) {
                find.amount += 1;
                return acc;
              }

              acc.push({
                id: item,
                amount: 1,
                level: 1,
              });
              return acc;
            }, [])
            .map((a) => `• **${a.amount}x** - ${ctx.locale(`items:${a.id as 1}.name`)}`)
            .join('\n'),
    );

    ctx.makeMessage({
      content: battleResults.users.map((a) => `<@${a.id}>`).join(', '),
      embeds: [resultEmbed],
      components: [actionRow([usePotionButton, takeItemsButton, readyButton])],
    });

    const collector = ctx.channel.createMessageComponentCollector({
      idle: 20000,
      filter: (int) =>
        int.customId.startsWith(`${baseId}`) &&
        battleResults.users.map((a) => a.id).includes(int.user.id),
    });

    collector.on('end', (_, reason) => {
      if (reason === 'user') return;

      battleResults.users.forEach((u) => {
        makeCooldown(u.cooldowns, {
          reason: 'dungeon',
          until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
        });
        ctx.client.repositories.roleplayRepository.postBattle(u.id, u);
      });

      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('success', 'commands:dungeon.results.back'),
      });
    });

    const readyPlayers: string[] = [];
    const playersToBeReady = battleResults.users.filter((a) => a.didParticipate).length;
    const potionPlayers: string[] = [];
    const itemsPlayers: string[] = [];

    const makeResultEmbed = () =>
      new MessageEmbed()
        .setTitle(ctx.prettyResponse('crown', 'commands:dungeon.results.title'))
        .setColor(COLORS.Purple)
        .addFields(
          battleResults.users.map((user, i) => ({
            name: ctx.locale('commands:dungeon.preparation.stats', {
              user: battleResults.discordUsers[i].username,
            }),
            value: ctx.locale('commands:dungeon.results.stats-description', {
              emojis,
              life: user.life,
              mana: user.mana,
              maxLife: getUserMaxLife(user),
              maxMana: getUserMaxMana(user),
              maxCapacity: getEquipmentById(user.backpack.id).data.levels[user.backpack.level]
                .value,
              capacity:
                getEquipmentById(user.backpack.id).data.levels[user.backpack.level].value -
                getFreeInventorySpace(user),
              experience: battleResults.didRunaway
                ? 0
                : battleResults.enemies.filter((a) => isDead(a)).length *
                  battleResults.enemies[0].experience,
            }),
            inline: true,
          })),
        )
        .setDescription(
          ctx.locale('commands:dungeon.results.finish', {
            amount: enemies.length,
            enemy: ctx.locale(`enemies:${enemies[0].id as 1}.name`),
          }),
        )
        .setFooter({
          text: ctx.locale('commands:dungeon.results.footer', {
            users: readyPlayers.length,
            maxUsers: battleResults.users.length,
          }),
        })
        .addField(
          ctx.locale('commands:dungeon.results.available-items'),
          availableLoots.length === 0
            ? ctx.locale('commands:dungeon.results.no-items')
            : availableLoots
                .reduce<InventoryItem[]>((acc, item) => {
                  const find = acc.find((a) => a.id === item);
                  if (find) {
                    find.amount += 1;
                    return acc;
                  }

                  acc.push({
                    id: item,
                    amount: 1,
                    level: 1,
                  });
                  return acc;
                }, [])
                .map((a) => `• **${a.amount}x** - ${ctx.locale(`items:${a.id as 1}.name`)}`)
                .join('\n'),
        );

    const usersLoots = getUsersLoots(battleResults.users, availableLoots);

    collector.on('collect', async (int) => {
      const resolvedId = resolveCustomId(int.customId);

      if (readyPlayers.length > playersToBeReady) {
        if (int.user.id !== battleResults.users[0].id) {
          int
            .reply({
              content: ctx.prettyResponse('warn', 'commands:dungeon.results.error-only-owner'),
              ephemeral: true,
            })
            .catch(debugError);
          return;
        }

        int.deferUpdate();

        switch (resolvedId) {
          case 'BACK': {
            collector.stop();
            ctx.makeMessage({
              content: ctx.prettyResponse('success', 'commands:dungeon.results.back'),
              components: [],
              embeds: [],
            });

            battleResults.users.forEach((u) => {
              makeCooldown(u.cooldowns, {
                reason: 'dungeon',
                until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
              });
              ctx.client.repositories.roleplayRepository.postBattle(u.id, u);
            });
            return;
          }
          case 'NEXT': {
            collector.stop();
            return DungeonCommand.DungeonLoop(ctx, battleResults.users, dungeonLevel + 1, 0);
          }
          case 'CONTINUE': {
            collector.stop();
            return DungeonCommand.DungeonLoop(
              ctx,
              battleResults.users,
              dungeonLevel,
              killedMobs + 1,
            );
          }
        }
      }

      if (readyPlayers.includes(int.user.id)) {
        int
          .reply({
            content: ctx.prettyResponse('warn', 'commands:dungeon.results.already_ready'),
            ephemeral: true,
          })
          .catch(debugError);
        return;
      }

      const user = battleResults.users.find((a) => a.id === int.user.id)!;

      if (resolvedId === 'USE_POTION') {
        if (isDead(user)) {
          int
            .reply({
              content: ctx.prettyResponse('error', 'commands:dungeon.results.user-dead'),
              ephemeral: true,
            })
            .catch(debugError);
          return;
        }

        const potionsToUse = user.inventory.filter((a) => getItemById(a.id).data.type === 'potion');

        if (potionsToUse.length === 0) {
          int
            .reply({
              content: ctx.prettyResponse('error', 'commands:dungeon.results.no-potions'),
              ephemeral: true,
            })
            .catch(debugError);
          return;
        }

        const selectPotions = new MessageSelectMenu()
          .setCustomId(`${baseId} | POTION`)
          .setMinValues(1);

        potionsToUse.forEach((potion) => {
          if (selectPotions.options.length < 25) {
            for (let i = 0; i < potion.amount; i++) {
              if (selectPotions.options.length < 25)
                selectPotions.addOptions({
                  label: ctx.locale(`items:${potion.id as 1}.name`),
                  value: `${potion.id} | ${potion.level} | ${i}`,
                });
            }
          }
        });

        selectPotions.setMaxValues(selectPotions.options.length);

        int
          .reply({
            content: ctx.prettyResponse('question', 'commands:dungeon.results.use-potion'),
            components: [actionRow([selectPotions])],
            ephemeral: true,
          })
          .catch(debugError);
        return;
      }

      if (resolvedId === 'POTION') {
        if (potionPlayers.includes(int.user.id)) {
          int
            .reply({
              content: ctx.prettyResponse('error', 'commands:dungeon.results.already_used_potions'),
              ephemeral: true,
            })
            .catch(debugError);
          return;
        }

        potionPlayers.push(int.user.id);

        (int as SelectMenuInteraction).values.forEach((a) => {
          const [itemId, itemLevel] = resolveSeparatedStrings(a);
          const item = getItemById<ConsumableItem>(Number(itemId));

          const toRegenValue = Math.floor(
            item.data.baseBoost + item.data.perLevel * Number(itemLevel),
          );
          const toRegenType = item.data.boostType;

          user[toRegenType] += toRegenValue;

          removeFromInventory([{ id: Number(itemId), level: Number(itemLevel) }], user.inventory);
        });

        user.life = Math.min(getUserMaxLife(user), user.life);

        user.mana = Math.min(getUserMaxMana(user), user.mana);

        int
          .update({
            components: [],
            content: ctx.prettyResponse('success', 'commands:dungeon.results.success_potions'),
          })
          .catch(debugError);

        ctx.makeMessage({ embeds: [makeResultEmbed()] });
        return;
      }

      if (resolvedId === 'PICK_ITEMS') {
        if (!user.didParticipate) {
          int
            .reply({
              content: ctx.prettyResponse('error', 'commands:dungeon.results.didnt-participate'),
              ephemeral: true,
            })
            .catch(debugError);
          return;
        }

        if (isInventoryFull(user)) {
          int
            .reply({
              content: ctx.prettyResponse('error', 'commands:dungeon.results.backpack-full'),
              ephemeral: true,
            })
            .catch(debugError);
          return;
        }

        const lootEarned = usersLoots.find((a) => a.id === int.user.id)!;

        const selectItems = new MessageSelectMenu()
          .setCustomId(`${baseId} | ITEM`)
          .setMinValues(1)
          .setPlaceholder(ctx.locale('commands:dungeon.results.grab'));

        let itemText = '';

        lootEarned.loots.forEach((a, i) => {
          itemText += `• **${ctx.locale(`items:${a as 1}.name`)}**\n`;

          selectItems.addOptions({
            label: `• ${ctx.locale(`items:${a as 1}.name`)}`,
            value: `${a} | ${i}`,
          });
        });

        const freeInventorySpace = getFreeInventorySpace(user);

        if (selectItems.options.length <= freeInventorySpace)
          selectItems.addOptions({
            label: ctx.locale('commands:dungeon.results.get-all-items'),
            value: 'ALL',
          });

        selectItems.setMaxValues(
          selectItems.options.length > freeInventorySpace
            ? freeInventorySpace
            : selectItems.options.length,
        );

        const pickItemsEmbed = new MessageEmbed()
          .addField(
            ctx.prettyResponse('chest', 'commands:dungeon.results.item-title'),
            ctx.locale('commands:dungeon.results.loots', {
              itemText,
              amount: freeInventorySpace,
            }),
          )
          .setThumbnail(int.user.displayAvatarURL({ dynamic: true }));

        int
          .reply({
            embeds: [pickItemsEmbed],
            components: [actionRow([selectItems])],
            ephemeral: true,
          })
          .catch(debugError);
        return;
      }

      if (resolvedId === 'ITEM') {
        if (itemsPlayers.includes(int.user.id)) {
          int
            .reply({
              content: ctx.prettyResponse('error', 'commands:dungeon.results.already_picked_items'),
              ephemeral: true,
            })
            .catch(debugError);
          return;
        }

        itemsPlayers.push(int.user.id);

        const lootEarned = usersLoots.find((a) => a.id === int.user.id)!;

        if ((int as SelectMenuInteraction).values.includes('ALL'))
          addToInventory(
            lootEarned.loots.map((a) => ({ id: a, level: 1 })),
            user.inventory,
          );
        else {
          const resolvedItems = (int as SelectMenuInteraction).values.map((a) => {
            const [id] = resolveSeparatedStrings(a);
            return { id: Number(id), level: 1 };
          });

          addToInventory(resolvedItems, user.inventory);
        }

        int
          .update({
            components: [],
            embeds: [],
            content: ctx.prettyResponse('success', 'commands:dungeon.results.success_items'),
          })
          .catch(debugError);

        ctx.makeMessage({ embeds: [makeResultEmbed()] });
        return;
      }

      if (resolvedId === 'READY') {
        readyPlayers.push(int.user.id);
        int.deferUpdate();

        if (readyPlayers.length !== playersToBeReady) {
          resultEmbed.setFooter({
            text: ctx.locale('commands:dungeon.results.footer', {
              users: readyPlayers.length,
              maxUsers: playersToBeReady,
            }),
          });
          ctx.makeMessage({ embeds: [resultEmbed] });
          return;
        }

        readyPlayers.push('DONE');

        const [backCustomId] = makeCustomId('BACK', baseId);
        const [continueCustomId] = makeCustomId('CONTINUE', baseId);
        const [nextCustomId] = makeCustomId('NEXT', baseId);

        const runawayButton = new MessageButton()
          .setCustomId(backCustomId)
          .setLabel(ctx.locale('commands:dungeon.back'))
          .setStyle('PRIMARY');

        const continueButton = new MessageButton()
          .setCustomId(continueCustomId)
          .setLabel(ctx.locale('commands:dungeon.continue', { level: dungeonLevel }))
          .setStyle('PRIMARY');

        const nextButton = new MessageButton()
          .setCustomId(nextCustomId)
          .setLabel(ctx.locale('commands:dungeon.next', { level: dungeonLevel + 1 }))
          .setStyle('PRIMARY');

        if (dungeonLevel === LAST_DUNGEON_LEVEL)
          nextButton.setDisabled(true).setLabel(ctx.locale('common:soon')).setEmoji('🛑');

        // TODO: change this system to use stamina
        if (killedMobs + 1 >= MOB_LIMIT_PER_DUNGEON_LEVEL) continueButton.setDisabled(true);

        ctx.makeMessage({
          content: `<@${users[0].id}>`,
          components: [actionRow([runawayButton, continueButton, nextButton])],
          embeds: [
            resultEmbed.setFooter({
              text: ctx.locale('commands:dungeon.results.only-owner', {
                user: battleResults.discordUsers[0].username,
              }),
            }),
          ],
        });
      }
    });
  }
}
