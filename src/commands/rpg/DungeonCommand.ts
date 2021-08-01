import { Message, MessageEmbed } from 'discord.js';
import { familiars as familiarsFile } from '@structures/RpgHandler';

import Command from '@structures/Command';
import MenheraClient from 'MenheraClient';
import CommandContext from '@structures/CommandContext';
import {
  battle,
  enemyShot,
  getAbilities,
  getEnemyByUserLevel,
  initialChecks,
} from '@structures/Rpgs/checks';
import { rpg } from '@structures/MenheraConstants';
import { IAbility, IBattleChoice, IDungeonMob, IUserRpgSchema, TDungeonLevel } from '@utils/Types';

export default class DungeonCommand extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'dungeon',
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async battle(
    ctx: CommandContext,
    inimigo: IDungeonMob,
    habilidades: IAbility[],
    user: IUserRpgSchema,
    type: 'boss' | 'dungeon',
  ): Promise<void> {
    await this.client.repositories.rpgRepository.update(ctx.message.author.id, {
      dungeonCooldown: `${rpg.bossCooldown + Date.now()}`,
      inBattle: true,
    });

    const options: IBattleChoice[] = [
      {
        name: ctx.locale('commands:dungeon.scape'),
        damage: '🐥',
        scape: true,
        cost: 0,
      },
    ];

    options.push({
      name: ctx.locale('commands:dungeon.battle.basic'),
      cost: 0,
      damage:
        user?.familiar?.id && user.familiar.type === 'damage'
          ? user.damage +
            user.weapon.damage +
            (familiarsFile[user.familiar.id].boost.value +
              (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
          : user.damage + user.weapon.damage,
    });

    habilidades.forEach((hab) => {
      options.push(hab);
    });

    let texto = `${ctx.locale('commands:dungeon.battle.enter', {
      type: inimigo.type,
      name: inimigo.name,
    })}\n\n❤️ | ${ctx.locale('commands:dungeon.life')}: **${inimigo.life}**\n⚔️ | ${ctx.locale(
      'commands:dungeon.damage',
    )}: **${inimigo.damage}**\n🛡️ | ${ctx.locale('commands:dungeon.armor')}: **${
      inimigo.armor
    }**\n\n${ctx.locale('commands:dungeon.battle.end')}`;

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${
        options[i].damage
      }**🗡️`;
    }

    const embed = new MessageEmbed()
      .setFooter(ctx.locale('commands:dungeon.battle.footer'))
      .setTitle(`${ctx.locale('commands:dungeon.battle.title')}${inimigo.name}`)
      .setColor('#f04682')
      .setDescription(texto);
    await ctx.sendC(ctx.message.author.toString(), embed);

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, {
      max: 1,
      time: 15000,
    });

    let time = false;

    collector.on('collect', (m) => {
      time = true;
      const choice = Number(m.content);
      if (choice >= 0 && choice < options.length) {
        return battle(ctx, options[choice], user, inimigo, type);
      }
      return enemyShot(
        ctx,
        user,
        inimigo,
        type,
        `⚔️ |  ${ctx.locale('commands:dungeon.battle.newTecnique')}`,
      );
    });

    setTimeout(() => {
      if (!time) {
        enemyShot(
          ctx,
          user,
          inimigo,
          type,
          `⚔️ |  ${ctx.locale('commands:dungeon.battle.timeout')}`,
        );
      }
    }, 15000);
  }

  async run(ctx: CommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
    if (!user) {
      await ctx.replyT('error', 'commands:dungeon.non-aventure');
      return;
    }

    if (!ctx.args[0]) {
      await ctx.replyT('error', 'commands:dungeon.no-args');
      return;
    }

    const polishedInput = ctx.args[0].replace(/\D+/g, '');

    if (!polishedInput) {
      await ctx.replyT('error', 'commands:dungeon.no-args');
      return;
    }

    const inimigo = getEnemyByUserLevel(
      user,
      'dungeon',
      parseInt(polishedInput) as TDungeonLevel,
      ctx,
    );

    if (!inimigo) {
      await ctx.replyT('error', 'commands:dungeon.no-level');
      return;
    }

    if (inimigo === 'LOW-LEVEL') return;

    const canGo = await initialChecks(user, ctx);

    if (!canGo) return;

    const dmgView =
      user?.familiar?.id && user.familiar.type === 'damage'
        ? user.damage +
          user.weapon.damage +
          (familiarsFile[user.familiar.id].boost.value +
            (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
        : user.damage + user.weapon.damage;
    const ptcView =
      user?.familiar?.id && user.familiar.type === 'armor'
        ? user.armor +
          user.protection.armor +
          (familiarsFile[user.familiar.id].boost.value +
            (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
        : user.armor + user.protection.armor;

    const habilidades = getAbilities(user);

    const embed = new MessageEmbed()
      .setTitle(`⌛ | ${ctx.locale('commands:dungeon.preparation.title')}`)
      .setDescription(ctx.locale('commands:dungeon.preparation.description'))
      .setColor('#e3beff')
      .setFooter(ctx.locale('commands:dungeon.preparation.footer'))
      .addField(
        ctx.locale('commands:dungeon.preparation.stats'),
        `🩸 | **${ctx.locale('commands:dungeon.life')}:** ${user.life}/${
          user.maxLife
        }\n💧 | **${ctx.locale('commands:dungeon.mana')}:** ${user.mana}/${
          user.maxMana
        }\n🗡️ | **${ctx.locale('commands:dungeon.dmg')}:** ${dmgView}\n🛡️ | **${ctx.locale(
          'commands:dungeon.armor',
        )}:** ${ptcView}\n🔮 | **${ctx.locale('commands:dungeon.ap')}:** ${
          user?.familiar?.id && user.familiar.type === 'abilityPower'
            ? user.abilityPower +
              (familiarsFile[user.familiar.id].boost.value +
                (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
            : user.abilityPower
        }\n\n${ctx.locale('commands:dungeon.preparation.description_end')}`,
      );
    habilidades.forEach((hab) => {
      embed.addField(
        hab.name,
        `🔮 | **${ctx.locale('commands:dungeon.damage')}:** ${hab.damage}\n💧 | **${ctx.locale(
          'commands:dungeon.cost',
        )}** ${hab.cost}`,
      );
    });
    await ctx.send(embed);

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, {
      max: 1,
      time: 30000,
    });

    collector.on('collect', (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        this.battle(ctx, inimigo as IDungeonMob, habilidades, user, 'dungeon');
      } else return ctx.replyT('error', 'commands:dungeon.arregou');
    });
  }
}
