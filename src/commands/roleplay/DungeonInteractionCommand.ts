import { RoleplayUserSchema } from '@roleplay/Types';
import { canGoToDungeon, getDungeonEnemy } from '@roleplay/utils/AdventureUtils';
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
import Util, { actionRow, resolveCustomId } from '@utils/Util';
import { MessageButton, MessageEmbed } from 'discord.js-light';

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

    return DungeonInteractionCommand.DungeonLoop(ctx, user);
  }

  static async DungeonLoop(
    ctx: InteractionCommandContext,
    user: RoleplayUserSchema,
  ): Promise<void> {
    const enemy = getDungeonEnemy(1, user.level);
    console.log(enemy);
    await battleLoop(
      user,
      enemy,
      ctx,
      ctx.locale('roleplay:battle.find', {
        enemy: ctx.locale(`enemies:${enemy.id as 1}.name`),
      }),
    );

    ctx.makeMessage({ content: 'Quer continuar ou meter o pe?', components: [], embeds: [] });
  }
}
