import {
  LAST_DUNGEON_LEVEL,
  MOB_LIMIT_PER_DUNGEON_LEVEL,
  ROLEPLAY_COOLDOWNS,
} from '@roleplay/Constants';
import { RoleplayUserSchema, UserBattleEntity } from '@roleplay/Types';
import {
  canUsersGoToDungeon,
  getDungeonEnemies,
  prepareUserForDungeon,
  getEnemyLoot,
  addToInventory,
  getFreeInventorySpace,
  isDead,
  isInventoryFull,
  makeCooldown,
  makeLevelUp,
  removeFromInventory,
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

import Util, {
  actionRow,
  makeCustomId,
  resolveSeparatedStrings,
  resolveCustomId,
} from '@utils/Util';

import {
  MessageButton,
  MessageActionRow,
  MessageSelectMenu,
  SelectMenuInteraction,
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

    if (toBattleUsers.some((a) => !a)) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:dungeon.preparation.no_party_members'),
      });
      return;
    }

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
        content: ctx.prettyResponse('error', 'common:timesup'),
      });
    });

    collector.on('collect', async (int: MessageComponentInteraction) => {
      if (resolveCustomId(int.customId) === 'NEGATE') {
        collector.stop('OWO');
        ctx.makeMessage({
          content: ctx.prettyResponse('error', 'commands:dungeon.arregou', {
            user: int.user.username,
          }),
        });
        return;
      }

      if (acceptedIds.includes(int.user.id)) return;
      acceptedIds.push(int.user.id);

      if (acceptedIds.length !== toBattleUsers.length) return;

      collector.stop('nya');
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

      if (battleResults.didRunaway) {
        makeCooldown(user.cooldowns, {
          reason: 'dungeon',
          until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
        });

        if (i === 0) embed.setDescription(ctx.locale('commands:dungeon.results.runaway'));
      }

      if (user.didParticipate) {
        user.experience +=
          battleResults.enemies.filter((a) => isDead(a)).length *
          battleResults.enemies[0].experience;

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

      embed.addField(
        ctx.locale('commands:dungeon.preparation.stats', {
          user: battleResults.discordUsers[i].username,
        }),
        ctx.locale('commands:dungeon.results.stats-description', {
          emojis,
          life: user.life,
          maxLife: getUserMaxLife(user),
          mana: user.mana,
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
      );

      makeCooldown(user.cooldowns, {
        reason: 'dungeon',
        until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
      });

      if (user.didParticipate || battleResults.didRunaway)
        ctx.client.repositories.roleplayRepository.postBattle(user.id, user);
    });

    if (battleResults.didRunaway) {
      ctx.makeMessage({ embeds: [resultEmbed], components: [], content: '' });
      return;
    }

    // TODO: "X mobs mortos! Após esta batalha, aqui estão os status atuais da sua equipe"
    // TODO: Split itens and potions into one embed, and status into another embed. When a user
    // click in a button (NEED TO CLICK THE BUTTON TO PICK ITENS OR POTIONS) will display ephemeral embed
    // to choose what it wants
    resultEmbed.setDescription(ctx.locale('commands:dungeon.results.finish'));

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

    if (killedMobs + 1 >= MOB_LIMIT_PER_DUNGEON_LEVEL) continueButton.setDisabled(true);

    const lootEarned = getEnemyLoot(enemies[0].loots);

    const toSendComponents: MessageActionRow[] = [
      actionRow([nextButton]),
      actionRow([continueButton]),
      actionRow([runawayButton]),
    ];

    if (battleResults.user.inventory.some((a) => getItemById(a.id).data.type === 'potion')) {
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
    }

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
  }
}
