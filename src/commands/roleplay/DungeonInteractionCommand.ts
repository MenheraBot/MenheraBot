import {
  LAST_DUNGEON_LEVEL,
  MOB_LIMIT_PER_DUNGEON_LEVEL,
  ROLEPLAY_COOLDOWNS,
} from '@roleplay/Constants';
import { ConsumableItem, RoleplayUserSchema } from '@roleplay/Types';
import {
  addToInventory,
  canGoToDungeon,
  getDungeonEnemy,
  getEnemyLoot,
  getFreeInventorySpace,
  isDead,
  isInventoryFull,
  makeCooldown,
  makeLevelUp,
  removeFromInventory,
} from '@roleplay/utils/AdventureUtils';
import { battleLoop } from '@roleplay/utils/BattleUtils';
import {
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
  getUserMaxMana,
} from '@roleplay/utils/Calculations';
import { getItemById } from '@roleplay/utils/DataUtils';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS } from '@structures/Constants';
import Util, { actionRow, resolveCustomId, resolveSeparatedStrings } from '@utils/Util';
import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';
import {
  BASE_LIFE_PER_CICLE,
  BASE_MANA_PER_CICLE,
  CICLE_DURATION_IN_MINUTES,
} from './ChurchInteractionCommand';

export default class DungeonInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'dungeon',
      description: '【ＲＰＧ】🦇 | Vá em uma aventura na Dungeon',
      category: 'roleplay',
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);

    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'common:unregistered') });
      return;
    }

    const mayNotGo = canGoToDungeon(user, ctx);

    if (!mayNotGo.canGo) {
      const embed = new MessageEmbed()
        .setColor('DARK_RED')
        .setFields(mayNotGo.reason)
        .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true }));
      ctx.makeMessage({ embeds: [embed] });
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('hourglass', 'commands:dungeon.preparation.title'))
      .setFooter({ text: ctx.locale('commands:dungeon.preparation.footer') })
      .setColor('#e3beff')
      .addField(
        ctx.locale('commands:dungeon.preparation.stats'),
        `${ctx.prettyResponse('blood', 'common:roleplay.life')}: **${user.life} / ${getUserMaxLife(
          user,
        )}**\n${ctx.prettyResponse('mana', 'common:roleplay.mana')}: **${
          user.mana
        } / ${getUserMaxMana(user)}**\n${ctx.prettyResponse(
          'armor',
          'common:roleplay.armor',
        )}: **${getUserArmor(user)}**\n${ctx.prettyResponse(
          'damage',
          'common:roleplay.damage',
        )}: **${getUserDamage(user)}**\n${ctx.prettyResponse(
          'intelligence',
          'common:roleplay.intelligence',
        )}: **${getUserIntelligence(user)}**`,
      );

    const accept = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | YES`)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('commands:dungeon.preparation.enter'));

    const negate = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NO`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('commands:dungeon.preparation.no'));

    await ctx.makeMessage({ embeds: [embed], components: [actionRow([accept, negate])] });

    const selected = await Util.collectComponentInteractionWithStartingId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      30000,
    );

    if (!selected || resolveCustomId(selected.customId) === 'NO') {
      ctx.makeMessage({
        components: [],
        embeds: [],
        content: ctx.prettyResponse('error', 'commands:dungeon.arregou'),
      });
      return;
    }

    return DungeonInteractionCommand.DungeonLoop(ctx, user, 1, 0);
  }

  static async DungeonLoop(
    ctx: InteractionCommandContext,
    user: RoleplayUserSchema,
    dungeonLevel: number,
    killedMobs: number,
  ): Promise<void> {
    const enemy = getDungeonEnemy(dungeonLevel, user.level);

    const battleResults = await battleLoop(
      user,
      enemy,
      ctx,
      ctx.locale('roleplay:battle.find', {
        enemy: ctx.locale(`enemies:${enemy.id as 1}.name`),
        level: enemy.level,
      }),
      killedMobs,
    );

    if (isDead(user)) {
      const userMaxLife = getUserMaxLife(user);
      const userMaxMana = getUserMaxMana(user);
      const lifePerCicle =
        BASE_LIFE_PER_CICLE + Math.floor(userMaxLife / 1000) * BASE_LIFE_PER_CICLE;

      const manaPerCicle =
        BASE_MANA_PER_CICLE + Math.floor(userMaxMana / 700) * BASE_MANA_PER_CICLE;

      const prayToMaxLife = (userMaxLife * CICLE_DURATION_IN_MINUTES) / lifePerCicle;
      const prayToMaxMana = (userMaxMana * CICLE_DURATION_IN_MINUTES) / manaPerCicle;

      const prayToMaximize = Math.max(prayToMaxLife, prayToMaxMana);
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.locale('roleplay:battle.user-death'),
      });

      makeCooldown(user.cooldowns, {
        reason: 'church',
        until: prayToMaximize * 60000 + Date.now(),
        data: 'DEATH',
      });

      user.life = getUserMaxLife(user);
      user.mana = getUserMaxMana(user);

      await ctx.client.repositories.roleplayRepository.postBattle(ctx.author.id, user);
      return;
    }

    const lootEarned = getEnemyLoot(enemy.loots);

    user.experience += Math.floor(battleResults.enemy.experience);

    const oldUserLevel = user.level;

    makeLevelUp(user);

    if (user.level > oldUserLevel) {
      user.life = getUserMaxLife(user);
      user.mana = getUserMaxMana(user);
      ctx.send({
        content: ctx.prettyResponse('level', 'common:roleplay.level-up', { level: user.level }),
        ephemeral: true,
      });
    }

    makeCooldown(user.cooldowns, {
      reason: 'dungeon',
      until: ROLEPLAY_COOLDOWNS.dungeonCooldown + Date.now(),
    });

    await ctx.client.repositories.roleplayRepository.postBattle(ctx.author.id, user);

    const embed = new MessageEmbed()
      .setTitle(ctx.prettyResponse('crown', 'commands:dungeon.results.title'))
      .setColor(COLORS.Purple)
      .setDescription(
        ctx.locale('commands:dungeon.results.description', {
          life: user.life,
          mana: user.mana,
          maxLife: getUserMaxLife(user),
          maxMana: getUserMaxMana(user),
        }),
      );

    const runawayButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | BACK`)
      .setLabel(ctx.locale('commands:dungeon.back'))
      .setStyle('PRIMARY');

    const continueButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | CONTINUE`)
      .setLabel(ctx.locale('commands:dungeon.continue', { level: dungeonLevel }))
      .setStyle('PRIMARY');

    const nextButton = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NEXT`)
      .setLabel(ctx.locale('commands:dungeon.next', { level: dungeonLevel + 1 }))
      .setStyle('PRIMARY');

    if (dungeonLevel === LAST_DUNGEON_LEVEL)
      nextButton.setDisabled(true).setLabel(ctx.locale('common:soon')).setEmoji('🛑');

    if (killedMobs + 1 >= MOB_LIMIT_PER_DUNGEON_LEVEL) continueButton.setDisabled(true);

    const toSendComponents: MessageActionRow[] = [
      actionRow([nextButton]),
      actionRow([continueButton]),
      actionRow([runawayButton]),
    ];

    if (user.inventory.some((a) => getItemById(a.id).data.type === 'potion')) {
      const selectPotions = new MessageSelectMenu()
        .setCustomId(`${ctx.interaction.id} | POTION`)
        .setMinValues(1)
        .setPlaceholder(ctx.locale('commands:dungeon.results.use-potion'));

      user.inventory.forEach((c) => {
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

    if (isInventoryFull(user)) {
      embed.addField(
        ctx.prettyResponse('chest', 'commands:dungeon.results.item-title'),
        ctx.locale('commands:dungeon.results.backpack-full'),
      );
    } else if (lootEarned && lootEarned.length > 0) {
      const selectItems = new MessageSelectMenu()
        .setCustomId(`${ctx.interaction.id} | ITEM`)
        .setMinValues(1)
        .setPlaceholder(ctx.locale('commands:dungeon.results.grab'));

      let itemText = '';

      lootEarned.forEach((a, i) => {
        itemText += `**${ctx.locale(`items:${a.id as 1}.name`)}** - ${ctx.locale(
          'common:roleplay.level',
        )} ${a.level}\n`;

        selectItems.addOptions({
          label: `• ${ctx.locale(`items:${a.id as 1}.name`)} | ${ctx.locale(
            'common:roleplay.level',
          )} ${a.level}`,
          value: `${a.id} | ${a.level} | ${i}`,
        });
      });

      const freeInventorySpace = getFreeInventorySpace(user);

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
        ctx.interaction.id,
        25_000,
      );

      if (!selectedItem) {
        ctx.makeMessage({ components: [] });
        return;
      }

      if (resolveCustomId(selectedItem.customId) === 'ITEM') {
        const resolvedItems = (selectedItem as SelectMenuInteraction).values.map((a) => {
          const [id, itemLevel] = resolveSeparatedStrings(a);
          return { id: Number(id), level: Number(itemLevel) };
        });

        addToInventory(resolvedItems, user.inventory);
        await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
          inventory: user.inventory,
        });

        toSendComponents.splice(
          toSendComponents.findIndex((a) =>
            a.components.some((b) => b.customId === `${ctx.interaction.id} | ITEM`),
          ),
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

          user[toRegenType] += toRegenValue;
          removeFromInventory([{ id: Number(itemId), level: Number(itemLevel) }], user.inventory);
        });

        if (user.life > getUserMaxLife(user)) user.life = getUserMaxLife(user);
        if (user.mana > getUserMaxMana(user)) user.mana = getUserMaxMana(user);

        await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
          mana: user.mana,
          life: user.life,
          inventory: user.inventory,
        });

        embed.setDescription(
          ctx.locale('commands:dungeon.results.description', {
            life: user.life,
            mana: user.mana,
            maxLife: getUserMaxLife(user),
            maxMana: getUserMaxMana(user),
          }),
        );

        toSendComponents.splice(
          toSendComponents.findIndex((a) =>
            a.components.some((b) => b.customId === `${ctx.interaction.id} | POTION`),
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
          return DungeonInteractionCommand.DungeonLoop(ctx, user, dungeonLevel + 1, 0);
        }
        case 'CONTINUE': {
          return DungeonInteractionCommand.DungeonLoop(ctx, user, dungeonLevel, killedMobs + 1);
        }
      }
    };
    selectButton();
  }
}
