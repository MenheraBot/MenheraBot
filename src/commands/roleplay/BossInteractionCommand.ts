import Checks from '@roleplay/Checks';
import {
  BattleChoice,
  IncomingAttackChoice,
  Mob,
  NormalAbility,
  RoleplayUserSchema,
  UniquePower,
} from '@roleplay/Types';
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

export default class BossInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'boss',
      description: '【ＲＰＧ】Batalhe contra um boss',
      category: 'roleplay',
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    if (!user) {
      ctx.makeMessage({
        content: ctx.prettyResponse('error', 'commands:boss.non-aventure'),
      });
      return;
    }

    if (user.level < 20) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:boss.min-level') });
      return;
    }

    const inimigo = Checks.getEnemyByUserLevel(user, 'boss') as Mob;
    const canGo = await Checks.initialChecks(user, ctx);

    if (!canGo) return;

    const dmgView = user.damage + user.weapon.damage;
    const ptcView = user.armor + user.protection.armor;

    const habilidades = Checks.getAbilities(user);

    if (user.uniquePower.name === 'Morte Instantânea') {
      habilidades.splice(
        habilidades.findIndex((i) => i.name === 'Morte Instantânea'),
        1,
      );
    }

    const embed = new MessageEmbed()
      .setTitle(`⌛ | ${ctx.locale('commands:boss.preparation.title')}`)
      .setDescription(ctx.locale('commands:boss.preparation.description'))
      .setColor('#e3beff')
      .setFooter({ text: ctx.locale('commands:boss.preparation.footer') })
      .addField(
        ctx.locale('commands:boss.preparation.stats'),
        `🩸 | **${ctx.locale('commands:boss.life')}:** ${user.life}/${
          user.maxLife
        }\n💧 | **${ctx.locale('commands:boss.mana')}:** ${user.mana}/${
          user.maxMana
        }\n🗡️ | **${ctx.locale('commands:boss.dmg')}:** ${dmgView}\n🛡️ | **${ctx.locale(
          'commands:boss.armor',
        )}:** ${ptcView}\n🔮 | **${ctx.locale('commands:boss.ap')}:** ${
          user.abilityPower
        }\n\n${ctx.locale('commands:boss.preparation.description_end')}`,
      );
    habilidades.forEach((hab) => {
      embed.addField(
        hab.name,
        `🔮 | **${ctx.locale('commands:boss.damage')}:** ${hab.damage}\n💧 | **${ctx.locale(
          'commands:boss.cost',
        )}** ${hab.cost}`,
      );
    });

    const accept = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | YES`)
      .setStyle('SUCCESS')
      .setLabel(ctx.locale('common:accept'));

    const negate = new MessageButton()
      .setCustomId(`${ctx.interaction.id} | NO`)
      .setStyle('DANGER')
      .setLabel(ctx.locale('common:negate'));

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
        content: ctx.prettyResponse('error', 'commands:boss.amarelou'),
      });
      return;
    }

    BossInteractionCommand.battle(ctx, inimigo, habilidades, user, 'boss');
  }

  static async battle(
    ctx: InteractionCommandContext,
    inimigo: Mob,
    habilidades: Array<UniquePower | NormalAbility>,
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
      name: ctx.locale('commands:boss.battle.basic'),
      damage: user.damage + user.weapon.damage,
    });

    habilidades.forEach((hab) => {
      options.push(hab);
    });

    let texto = `${ctx.locale('commands:boss.battle.enter', {
      enemy: inimigo.name,
    })}\n\n❤️ | ${ctx.locale('commands:boss.life')}: **${inimigo.life}**\n⚔️ | ${ctx.locale(
      'commands:boss.damage',
    )}: **${inimigo.damage}**\n🛡️ | ${ctx.locale('commands:boss.armor')}: **${
      inimigo.armor
    }**\n\n${ctx.locale('commands:boss.battle.end')}`;

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
      .setFooter({ text: ctx.locale('commands:boss.battle.footer') })
      .setTitle(`BossBattle: ${inimigo.name}`)
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
