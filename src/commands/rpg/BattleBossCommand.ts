import { Message, MessageEmbed } from 'discord.js';
import Command from '@structures/Command';
import { familiars as familiarsFile } from '@structures/RpgHandler';
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
import { IAbility, IBattleChoice, IDungeonMob, IUserRpgSchema } from '@utils/Types';

export default class BattleBoss extends Command {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'boss',
      cooldown: 5,
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

    const options: Array<IBattleChoice> = [
      {
        name: ctx.locale('commands:dungeon.scape'),
        damage: '🐥',
        scape: true,
        cost: 0,
      },
    ];

    options.push({
      name: ctx.locale('commands:boss.battle.basic'),
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

    let texto = `${ctx.locale('commands:boss.battle.enter', {
      enemy: inimigo.name,
    })}\n\n❤️ | ${ctx.locale('commands:boss.life')}: **${inimigo.life}**\n⚔️ | ${ctx.locale(
      'commands:boss.damage',
    )}: **${inimigo.damage}**\n🛡️ | ${ctx.locale('commands:boss.armor')}: **${
      inimigo.armor
    }**\n\n${ctx.locale('commands:boss.battle.end')}`;

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${
        options[i].damage
      }**🗡️`;
    }

    const embed = new MessageEmbed()
      .setFooter(ctx.locale('commands:boss.battle.footer'))
      .setTitle(`BossBattle: ${inimigo.name}`)
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
        `⚔️ |  ${ctx.locale('commands:boss.battle.newTecnique')}`,
      );
    });

    setTimeout(() => {
      if (!time) {
        return enemyShot(
          ctx,
          user,
          inimigo,
          type,
          `⚔️ |  ${ctx.locale('commands:boss.battle.timeout')}`,
        );
      }
    }, 15000);
  }

  async run(ctx: CommandContext): Promise<void> {
    const user = await this.client.repositories.rpgRepository.find(ctx.message.author.id);
    if (!user) {
      await ctx.replyT('error', 'commands:boss.non-aventure');
      return;
    }

    if (user.level < 20) {
      await ctx.replyT('error', 'commands:boss.min-level');
      return;
    }

    const inimigo = getEnemyByUserLevel(user, 'boss') as IDungeonMob;
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
      .setFooter(ctx.locale('commands:boss.preparation.footer'))
      .addField(
        ctx.locale('commands:boss.preparation.stats'),
        `🩸 | **${ctx.locale('commands:boss.life')}:** ${user.life}/${
          user.maxLife
        }\n💧 | **${ctx.locale('commands:boss.mana')}:** ${user.mana}/${
          user.maxMana
        }\n🗡️ | **${ctx.locale('commands:boss.dmg')}:** ${dmgView}\n🛡️ | **${ctx.locale(
          'commands:boss.armor',
        )}:** ${ptcView}\n🔮 | **${ctx.locale('commands:boss.ap')}:** ${
          user?.familiar?.id && user.familiar.type === 'abilityPower'
            ? user.abilityPower +
              (familiarsFile[user.familiar.id].boost.value +
                (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
            : user.abilityPower
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
    await ctx.send(embed);

    const filter = (m: Message) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, {
      max: 1,
      time: 30000,
    });

    collector.on('collect', (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        this.battle(ctx, inimigo, habilidades, user, 'boss');
      } else return ctx.replyT('error', 'commands:boss.amarelou');
    });
  }
}
