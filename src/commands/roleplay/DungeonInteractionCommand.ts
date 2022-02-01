import { RoleplayUserSchema } from '@roleplay/Types';
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
} from '@roleplay/utils/AdventureUtils';
import { battleLoop } from '@roleplay/utils/BattleUtils';
import {
  getUserArmor,
  getUserDamage,
  getUserIntelligence,
  getUserMaxLife,
  getUserMaxMana,
} from '@roleplay/utils/Calculations';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { COLORS, ROLEPLAY_CONSTANTS } from '@structures/Constants';
import Util, { actionRow, resolveCustomId, resolveSeparatedStrings } from '@utils/Util';
import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from 'discord.js-light';

export default class DungeonInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'dungeon',
      description: '【ＲＰＧ】Vá em uma aventura na Dungeon',
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

    return DungeonInteractionCommand.DungeonLoop(ctx, user, 1);
  }

  static async DungeonLoop(
    ctx: InteractionCommandContext,
    user: RoleplayUserSchema,
    dungeonLevel: number,
  ): Promise<void> {
    const enemy = getDungeonEnemy(dungeonLevel, user.level);

    const battleResults = await battleLoop(
      user,
      enemy,
      ctx,
      ctx.locale('roleplay:battle.find', {
        enemy: ctx.locale(`enemies:${enemy.id as 1}.name`),
      }),
    );

    if (isDead(user)) {
      ctx.makeMessage({
        embeds: [],
        components: [],
        content: ctx.locale('roleplay:battle.user-death'),
      });

      user.cooldowns = makeCooldown(user.cooldowns, {
        reason: 'death',
        until: ROLEPLAY_CONSTANTS.deathCooldown + Date.now(),
      });

      await ctx.client.repositories.roleplayRepository.postBattle(ctx.author.id, user);
      return;
    }

    const lootEarned = getEnemyLoot(enemy.loots);

    user.experience += battleResults.enemy.experience;

    const { level, experience, holyBlessings } = makeLevelUp(user);

    user.level = level;
    user.experience = experience;
    user.holyBlessings = holyBlessings;

    user.cooldowns = makeCooldown(user.cooldowns, {
      reason: 'dungeon',
      until: ROLEPLAY_CONSTANTS.dungeonCooldown + Date.now(),
    });

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

    const toSendComponents: MessageActionRow[] = [
      actionRow([nextButton]),
      actionRow([continueButton]),
      actionRow([runawayButton]),
    ];

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

    let hasSaved = false;

    const selectButton = async () => {
      const selectedItem = await Util.collectComponentInteractionWithStartingId(
        ctx.channel,
        ctx.author.id,
        ctx.interaction.id,
        12000,
      );

      if (!selectedItem) {
        if (!hasSaved)
          await ctx.client.repositories.roleplayRepository.postBattle(ctx.author.id, user);
        return;
      }

      if (resolveCustomId(selectedItem.customId) === 'ITEM') {
        const resolvedItems = (selectedItem as SelectMenuInteraction).values.map((a) => {
          const [id, itemLevel] = resolveSeparatedStrings(a);
          return { id: Number(id), level: Number(itemLevel) };
        });

        user.inventory = addToInventory(resolvedItems, user.inventory);
        await ctx.client.repositories.roleplayRepository.postBattle(ctx.author.id, user);
        hasSaved = true;

        ctx.makeMessage({ components: toSendComponents.splice(1, 3) });
        selectButton();
      } else {
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
            return DungeonInteractionCommand.DungeonLoop(ctx, user, dungeonLevel + 1);
          }
          case 'CONTINUE': {
            return DungeonInteractionCommand.DungeonLoop(ctx, user, dungeonLevel);
          }
        }
      }
    };
    selectButton();
  }
}
