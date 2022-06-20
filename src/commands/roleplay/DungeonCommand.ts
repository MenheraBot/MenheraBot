import {
  // LAST_DUNGEON_LEVEL,
  // MOB_LIMIT_PER_DUNGEON_LEVEL,
  ROLEPLAY_COOLDOWNS,
} from '@roleplay/Constants';
import {
  InventoryItem,
  /* LeveledItem */ RoleplayUserSchema,
  UserBattleEntity,
} from '@roleplay/Types';
import {
  canUsersGoToDungeon,
  getDungeonEnemies,
  prepareUserForDungeon,
  getEnemyLoot,
  // addToInventory,
  getFreeInventorySpace,
  isDead,
  isInventoryFull,
  makeCooldown,
  makeLevelUp,
  // removeFromInventory,
} from '@roleplay/utils/AdventureUtils';
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
  makeCustomId,
  // resolveSeparatedStrings,
  resolveCustomId,
} from '@utils/Util';

import {
  MessageButton,
  /* MessageActionRow,
  MessageSelectMenu,
  SelectMenuInteraction, */
  MessageEmbed,
  MessageComponentInteraction,
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

    console.log(toBattleUsers.map((a) => a.id));

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

    console.log(toBattleUsers.map((a) => a.id));

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

    // TODO: Remove hard coded arrays and add party and multiple mobs
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

    const resultEmbed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('crown', 'commands:dungeon.results.title'))
      .setColor(COLORS.Purple);

    battleResults.users.forEach((user, i) => {
      if (isDead(user) && user.didParticipate) {
        const { prayMinutesToMaxStatus } = getUserChurchStatus(user);

        makeCooldown(user.cooldowns, {
          reason: 'church',
          until: prayMinutesToMaxStatus * 60000 + Date.now() + ROLEPLAY_COOLDOWNS.deathPunishment,
          data: 'DEATH',
        });
      }

      if (battleResults.didRunaway)
        makeCooldown(user.cooldowns, {
          reason: 'dungeon',
          until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
        });

      const deadEnemies = battleResults.enemies.filter((a) => isDead(a)).length;

      if (user.didParticipate && deadEnemies > 0) {
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

      makeCooldown(user.cooldowns, {
        reason: 'dungeon',
        until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
      });

      if (user.didParticipate || battleResults.didRunaway)
        ctx.client.repositories.roleplayRepository.postBattle(user.id, user);
    });

    if (battleResults.didRunaway) {
      resultEmbed
        .setDescription(ctx.locale('commands:dungeon.results.runaway'))
        .setColor(COLORS.Colorless);
      ctx.makeMessage({ embeds: [resultEmbed], components: [], content: null });
      return;
    }

    // TODO: Split itens and potions into one embed, and status into another embed. When a user
    // click in a button (NEED TO CLICK THE BUTTON TO PICK ITENS OR POTIONS) will display ephemeral embed
    // to choose what it wants
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

    const availableLoots = getEnemyLoot(enemies[0].loots);

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

    resultEmbed.addField('\u200b', '\u200b', false);

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
      components: [actionRow([usePotionButton, takeItemsButton])],
    });

    console.log(battleResults);

    /*
    
          =========================================================================
               const selectPotions = new MessageSelectMenu()
            .setCustomId(`${baseId} | POTION`)
            .setMinValues(1)
            .setPlaceholder(ctx.locale('commands:dungeon.results.use-potion'));
    
          battleResults.user.inventory.forEach((c) => {
            const item = getItemById(c.id);
            if (item.data.type === 'potion') {
              if (selectPotions.options.length < 25) {
                for (let i = 0; i < c.amount; i++) {
                  selectPotions.addOptions({
                    label: ctx.locale(`items:${c.id as 1}.name`),
                    value: `${c.id} | ${c.level} | ${i}`,
                  });
                }
              }
            }
          });
    
          selectPotions.setMaxValues(selectPotions.options.length);
          toSendComponents.push(actionRow([selectPotions]));
          ========================================================================
    
        */

    /* ITEMS SYTEMS

          
    if (isInventoryFull(battleResults.user)) {
      embed.addField(
        ctx.prettyResponse('chest', 'commands:dungeon.results.item-title'),
        ctx.locale('commands:dungeon.results.backpack-full'),
      );
    } else if (lootEarned && lootEarned.length > 0) {
      const selectItems = new MessageSelectMenu()
        .setCustomId(`${baseId} | ITEM`)
        .setMinValues(1)
        .setPlaceholder(ctx.locale('commands:dungeon.results.grab'))
        .addOptions({ label: ctx.locale('commands:dungeon.results.get-all-items'), value: 'ALL' });

      let itemText = '';

      lootEarned.forEach((a, i) => {
        itemText += `**${ctx.locale(`items:${a as 1}.name`)}**\n`;

        selectItems.addOptions({
          label: `• ${ctx.locale(`items:${a as 1}.name`)}`,
          value: `${a} | ${i}`,
        });
      });

      const freeInventorySpace = getFreeInventorySpace(battleResults.user);

      selectItems.setMaxValues(
        selectItems.options.length > freeInventorySpace
          ? freeInventorySpace
          : selectItems.options.length,
      );

      embed
        .addField(
          ctx.prettyResponse('chest', 'commands:dungeon.results.item-title'),
          ctx.locale('commands:dungeon.results.loots', {
            itemText,
            amount: freeInventorySpace,
          }),
        )
        .setFooter({ text: ctx.locale('commands:dungeon.results.footer') });

      toSendComponents.push(actionRow([selectItems]));
    }
    */

    /* ========= ONLY THE OWNER OF THE PARTY MAY SELECT THIS ===================
    
     actionRow([runawayButton, continueButton, nextButton]),

    const [backCustomId, baseId] = makeCustomId('BACK');
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
    */
    /*
    ctx.makeMessage({
      components: toSendComponents.reverse(),
      embeds: [embed],
    });

    const selectButton = async (): Promise<void> => {
      const selectedItem = await Util.collectComponentInteractionWithStartingId(
        ctx.channel,
        ctx.author.id,
        baseId,
        25_000,
      );

      if (!selectedItem) {
        ctx.makeMessage({ components: [] });
        return;
      }

      if (resolveCustomId(selectedItem.customId) === 'ITEM') {
        if ((selectedItem as SelectMenuInteraction).values.includes('ALL'))
          addToInventory(
            lootEarned.map((a) => ({ id: a, level: 1 })),
            battleResults.user.inventory,
          );
        else {
          const resolvedItems = (selectedItem as SelectMenuInteraction).values.map((a) => {
            const [id, itemLevel] = resolveSeparatedStrings(a);
            return { id: Number(id), level: Number(itemLevel) };
          });

          addToInventory(resolvedItems, battleResults.user.inventory);
        }

        await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
          inventory: battleResults.user.inventory,
        });

        toSendComponents.splice(
          toSendComponents.findIndex((a) => a.components.some((b) => b.customId?.endsWith('ITEM'))),
          1,
        );

        ctx.makeMessage({
          components: toSendComponents,
        });
        return selectButton();
      }

      if (resolveCustomId(selectedItem.customId) === 'POTION') {
        (selectedItem as SelectMenuInteraction).values.forEach((a) => {
          const [itemId, itemLevel] = resolveSeparatedStrings(a);
          const item = getItemById<ConsumableItem>(Number(itemId));

          const toRegenValue = Math.floor(
            item.data.baseBoost + item.data.perLevel * Number(itemLevel),
          );
          const toRegenType = item.data.boostType;

          battleResults.user[toRegenType] += toRegenValue;
          removeFromInventory(
            [{ id: Number(itemId), level: Number(itemLevel) }],
            battleResults.user.inventory,
          );
        });

        battleResults.user.life = Math.min(userMaxLife, battleResults.user.life);

        battleResults.user.mana = Math.min(userMaxMana, battleResults.user.mana);

        await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
          life: battleResults.user.life,
          mana: battleResults.user.mana,
          inventory: battleResults.user.inventory,
        });

        embed.setDescription(
          ctx.locale('commands:dungeon.results.description', {
            life: battleResults.user.life,
            mana: battleResults.user.mana,
            maxLife: userMaxLife,
            maxMana: userMaxMana,
          }),
        );

        toSendComponents.splice(
          toSendComponents.findIndex((a) =>
            a.components.some((b) => b.customId?.endsWith('POTION')),
          ),
          1,
        );

        ctx.makeMessage({
          embeds: [embed],
          components: toSendComponents,
        });
        return selectButton();
      }

      switch (resolveCustomId(selectedItem.customId)) {
        case 'BACK': {
          ctx.makeMessage({
            content: ctx.prettyResponse('success', 'commands:dungeon.results.back'),
            components: [],
            embeds: [],
          });
          break;
        }
        case 'NEXT': {
          return DungeonCommand.DungeonLoop(ctx, battleResults.user, dungeonLevel + 1, 0);
        }
        case 'CONTINUE': {
          return DungeonCommand.DungeonLoop(ctx, battleResults.user, dungeonLevel, killedMobs + 1);
        }
      }
    };
    selectButton();
    */
  }
}
