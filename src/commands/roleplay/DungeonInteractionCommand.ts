import Checks from '@roleplay/Checks';
import { BattleChoice, IncomingAttackChoice, Mob, RoleplayUserSchema } from '@roleplay/Types';
import { canGoToDungeon } from '@roleplay/utils/AdventureUtils';
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
import { ROLEPLAY_CONSTANTS } from '@structures/Constants';
import Util, { actionRow, resolveCustomId } from '@utils/Util';
import {
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

    const enemy = Checks.getEnemyByUserLevel(user, 'dungeon', 1, ctx) as Mob;

    battleLoop(user, enemy, ctx);
    // DungeonInteractionCommand.battle(ctx, inimigo as Mob, habilidades, user, 'dungeon');
  }

  static async battle(
    ctx: InteractionCommandContext,
    inimigo: Mob,
    habilidades: 'a', // Array<UniquePower | NormalAbility>,
    user: RoleplayUserSchema,
    type: BattleChoice,
  ): Promise<void> {
    await ctx.client.repositories.roleplayRepository.updateUser(ctx.author.id, {
      inBattle: true,
      dungeonCooldown: ROLEPLAY_CONSTANTS.bossCooldown + Date.now(),
    });

    const options: IncomingAttackChoice[] = [
      {
        name: ctx.locale('commands:dungeon.scape'),
        damage: 0,
        scape: true,
      },
    ];

    options.push({
      name: ctx.locale('commands:dungeon.battle.basic'),
      damage: user.damage + user.weapon.damage,
    });
    /* 
    habilidades.forEach((hab) => {
      options.push(hab);
    }); */

    let texto = `${ctx.locale('commands:dungeon.battle.enter', {
      enemy: inimigo.name,
    })}`;

    const action = new MessageSelectMenu()
      .setCustomId(`${ctx.interaction.id} | ATTACK`)
      .setMinValues(1)
      .setMaxValues(1);

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${
        options[i].damage
      }**🗡️`;
      action.addOptions({ label: options[i].name, value: `${i}` });
    }

    const embed = new MessageEmbed()
      .setFooter({ text: ctx.locale('commands:dungeon.battle.footer') })
      .setTitle(`${ctx.locale('commands:dungeon.battle.title')}${inimigo.name}`)
      .setColor('#f04682')
      .setDescription(texto);

    ctx.makeMessage({ embeds: [embed], components: [actionRow([action])] });

    const selected = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      7500,
    );

    if (!selected)
      return Checks.enemyShot(
        ctx,
        user,
        inimigo,
        type,
        `⚔️ | ${ctx.locale('roleplay:battle.timeout')}`,
      );

    Checks.battle(ctx, options[Number(selected.values[0])], user, inimigo, type);
  }
}
