import Checks from '@roleplay/Checks';
import {
  BattleChoice,
  DungeonLevels,
  IncomingAttackChoice,
  Mob,
  RoleplayUserSchema,
} from '@roleplay/Types';
import { getUserMaxLife, getUserMaxMana } from '@roleplay/utils/Calculations';
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
      description: '【ＲＰＧ】Vá para uma aventura na Dungeon',
      category: 'roleplay',
      options: [
        {
          name: 'nivel',
          type: 'INTEGER',
          description: 'Nível da dungeon que desejas ir',
          choices: [
            { name: '1', value: 1 },
            { name: '2', value: 2 },
            { name: '3', value: 3 },
            { name: '4', value: 4 },
            { name: '5', value: 5 },
          ],
          required: true,
        },
      ],
      cooldown: 7,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = await ctx.client.repositories.roleplayRepository.findUser(ctx.author.id);
    const level = ctx.options.getInteger('nivel', true) as DungeonLevels;

    if (!user) {
      ctx.makeMessage({ content: ctx.prettyResponse('error', 'commands:dungeon.non-aventure') });
      return;
    }

    const inimigo = Checks.getEnemyByUserLevel(user, 'dungeon', level, ctx);

    if (inimigo === 'LOW-LEVEL') return;

    const canGo = await Checks.initialChecks(user, ctx);

    if (!canGo) return;

    const dmgView = user.damage + (user.weapon?.damage ?? 0);
    const ptcView = user.armor + (user.protection?.armor ?? 0);

    const habilidades = 'a'; // Checks.getAbilities(user);

    const embed = new MessageEmbed()
      .setTitle(`⌛ | ${ctx.locale('commands:dungeon.preparation.title')}`)
      .setDescription(ctx.locale('commands:dungeon.preparation.description'))
      .setColor('#e3beff')
      .setFooter({ text: ctx.locale('commands:dungeon.preparation.footer') })
      .addField(
        ctx.locale('commands:dungeon.preparation.stats'),
        `🩸 | **${ctx.locale('commands:dungeon.life')}:** ${user.life}/${getUserMaxLife(
          user,
        )}\n💧 | **${ctx.locale('commands:dungeon.mana')}:** ${user.mana}/${getUserMaxMana(
          user,
        )}\n🗡️ | **${ctx.locale('commands:dungeon.dmg')}:** ${dmgView}\n🛡️ | **${ctx.locale(
          'commands:dungeon.armor',
        )}:** ${ptcView}\n🔮 | **${ctx.locale('commands:dungeon.ap')}:** ${
          1 //  user.abilityPower
        }\n\n${ctx.locale('commands:dungeon.preparation.description_end')}`,
      );
    /*   habilidades.forEach((hab) => {
      embed.addField(
        hab.name,
        `🔮 | **${ctx.locale('commands:dungeon.damage')}:** ${hab.damage}\n💧 | **${ctx.locale(
          'commands:dungeon.cost',
        )}** ${hab.cost}`,
      );
    }); */

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
        content: ctx.prettyResponse('error', 'commands:dungeon.arregou'),
      });
      return;
    }

    DungeonInteractionCommand.battle(ctx, inimigo as Mob, habilidades, user, 'dungeon');
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
    })}\n\n❤️ | ${ctx.locale('commands:dungeon.life')}: **${inimigo.life}**\n⚔️ | ${ctx.locale(
      'commands:dungeon.damage',
    )}: **${inimigo.damage}**\n🛡️ | ${ctx.locale('commands:dungeon.armor')}: **${
      inimigo.armor
    }**\n\n${ctx.locale('commands:dungeon.battle.end')}`;

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
