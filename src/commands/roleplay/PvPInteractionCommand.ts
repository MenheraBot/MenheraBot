import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageEmbed } from 'discord.js-light';

export default class PvPInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'pvp',
      description: '【ＲＰＧ】PvP de Cria',
      category: 'roleplay',
      cooldown: 7,
      authorDataFields: ['selectedColor'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const mention = ctx.message.mentions.users.first();
    const valor = ctx.args[1];
    if (!mention) return ctx.replyT('error', 'commands:pvp.no-args');

    if (mention.bot) return ctx.replyT('error', 'commands:pvp.bot');

    if (mention === ctx.message.author) return ctx.replyT('error', 'comands:pvp.self-mention');

    const user1 = await this.client.database.Rpg.findById(ctx.message.author.id);
    const user2 = await this.client.database.Rpg.findById(mention.id);

    if (!user1 || !user2) return ctx.replyT('error', 'commands:pvp.no-user');

    const dmgView2 =
      user2?.familiar?.id && user2.familiar.type === 'damage'
        ? user2.damage +
          user2.weapon.damage +
          (familiarsFile[user2.familiar.id].boost.value +
            (user2.familiar.level - 1) * familiarsFile[user2.familiar.id].boost.value)
        : user2.damage + user2.weapon.damage;
    const ptcView2 =
      user2?.familiar?.id && user2.familiar.type === 'armor'
        ? user2.armor +
          user2.protection.armor +
          (familiarsFile[user2.familiar.id].boost.value +
            (user2.familiar.level - 1) * familiarsFile[user2.familiar.id].boost.value)
        : user2.armor + user2.protection.armor;
    const dmgView1 =
      user1?.familiar?.id && user1.familiar.type === 'damage'
        ? user1.damage +
          user1.weapon.damage +
          (familiarsFile[user1.familiar.id].boost.value +
            (user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)
        : user1.damage + user1.weapon.damage;
    const ptcView1 =
      user1?.familiar?.id && user1.familiar.type === 'armor'
        ? user1.armor +
          user1.protection.armor +
          (familiarsFile[user1.familiar.id].boost.value +
            (user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)
        : user1.armor + user1.protection.armor;

    const embed = new MessageEmbed()
      .setTitle(ctx.locale('commands:pvp.accept-battle', { user: ctx.message.author.tag }))
      .setColor('#8bf1f0')
      .setFooter(ctx.locale('commands:pvp.not-competitive'))
      .setDescription(
        `**${ctx.locale('commands:pvp.your-status')}**\n\n🩸 | ** ${ctx.locale(
          'commands:dungeon.life',
        )}:** ${user2.life} / ${user2.maxLife}\n💧 | ** ${ctx.locale('commands:dungeon.mana')}:** ${
          user2.mana
        } / ${user2.maxMana}\n🗡️ | ** ${ctx.locale(
          'commands:dungeon.dmg',
        )}:** ${dmgView2}\n🛡️ | ** ${ctx.locale(
          'commands:dungeon.armor',
        )}:** ${ptcView2}\n🔮 | ** ${ctx.locale('commands:dungeon.ap')}:** ${
          user2.abilityPower
        }\n\n**${ctx.locale('commands:pvp.enemy-status', {
          user: ctx.message.author.tag,
        })}**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🩸 | **${ctx.locale('commands:dungeon.life')}:** ${user1.life} / ${
          user1.maxLife
        }\n💧 | ** ${ctx.locale('commands:dungeon.mana')}:** ${user1.mana} / ${
          user1.maxMana
        }\n🗡️ | ** ${ctx.locale('commands:dungeon.dmg')}:** ${dmgView1}\n🛡️ | ** ${ctx.locale(
          'commands:dungeon.armor',
        )}:** ${ptcView1}\n🔮 | ** ${ctx.locale('commands:dungeon.ap')}:** ${
          user1.abilityPower
        }\n-----------------------------\n ${ctx.locale('commands:pvp.send-to-accept')}`,
      );

    let aposta = false;

    if (valor) {
      if (user1.life <= 0 || user2.life <= 0) return ctx.replyT('error', 'commands:pvp.no-life');
      aposta = parseInt(valor.replace(/\D+/g, ''));
      if (Number.isNaN(aposta)) return ctx.replyT('error', 'commands:pvp.invalid-value');
      if (aposta <= 0) return ctx.replyT('error', 'commands:pvp.invalid-value');
      if (aposta > user1.money) return ctx.replyT('error', 'commands:pvp.you-poor');
      if (aposta > user2.money)
        return ctx.replyT('error', 'commands:pvp.his-poor', { user: mention.tag });
      embed.setColor('RED');
      embed.setFooter(ctx.locale('commands:pvp.is-competitive', { aposta }));
    }

    if (user1.inBattle) return ctx.replyT('error', 'commands:pvp.in-battle-one');
    if (user2.inBattle) return ctx.replyT('error', 'commands:pvp.in-battle-two');

    if (!aposta)
      embed.setDescription(
        `**${ctx.locale('commands:pvp.your-status')}**\n\n🩸 | ** ${ctx.locale(
          'commands:dungeon.life',
        )}:** ${user2.maxLife}\n💧 | ** ${ctx.locale('commands:dungeon.mana')}:** ${
          user2.maxMana
        }\n🗡️ | ** ${ctx.locale('commands:dungeon.dmg')}:** ${dmgView2}\n🛡️ | ** ${ctx.locale(
          'commands:dungeon.armor',
        )}:** ${ptcView2}\n🔮 | ** ${ctx.locale('commands:dungeon.ap')}:** ${
          user2.abilityPower
        }\n\n**${ctx.locale('commands:pvp.enemy-status', {
          user: ctx.message.author.tag,
        })}**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🩸 | **${ctx.locale('commands:dungeon.life')}:** ${
          user1.maxLife
        }\n💧 | ** ${ctx.locale('commands:dungeon.mana')}:** ${user1.maxMana}\n🗡️ | ** ${ctx.locale(
          'commands:dungeon.dmg',
        )}:** ${dmgView1}\n🛡️ | ** ${ctx.locale(
          'commands:dungeon.armor',
        )}:** ${ptcView1}\n🔮 | ** ${ctx.locale('commands:dungeon.ap')}:** ${
          user1.abilityPower
        }\n-----------------------------\n ${ctx.locale('commands:pvp.send-to-accept')}`,
      );

    ctx.sendC(mention, embed);

    const acceptFilter = (m) => m.author.id === mention.id;
    const acceptCollector = ctx.message.channel.createMessageCollector(acceptFilter, {
      max: 1,
      time: 10000,
      errors: ['time'],
    });

    acceptCollector.on('collect', async (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        user1.inBattle = true;
        user2.inBattle = true;
        await user1.save();
        await user2.save();

        return this.makeBattle(user1, user2, ctx.message.author, mention, aposta, ctx);
      }

      return ctx.replyT('error', 'commands:pvp.negated', { user: mention.tag });
    });
  }

  async makeBattle(user1, user2, member1, member2, aposta, ctx) {
    const options = [];

    if (!aposta) {
      user1.life = user1.maxLife;
      user1.mana = user1.maxMana;
      user2.life = user2.maxLife;
      user2.mana = user2.maxMana;
    }

    options.push({
      name: ctx.locale('commands:dungeon.battle.basic'),
      damage:
        user1?.familiar?.id && user1.familiar.type === 'damage'
          ? user1.damage +
            user1.weapon.damage +
            (familiarsFile[user1.familiar.id].boost.value +
              (user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)
          : user1.damage + user1.weapon.damage,
    });

    const user1abilities = await this.client.rpgChecks.getAbilities(user1);
    const user2abilities = await this.client.rpgChecks.getAbilities(user2);

    options.push(...user1abilities);

    let texto = `${ctx.locale('commands:pvp.battle.enter', {
      user1: member1.tag,
      user2: member2.tag,
    })}\n\n❤️ | ${ctx.locale('commands:dungeon.life')}: **${user2.life}**\n⚔️ | ${ctx.locale(
      'commands:dungeon.damage',
    )}: **${user2.damage}**\n🛡️ | ${ctx.locale('commands:dungeon.armor')}: **${
      user2.armor
    }**\n\n${ctx.locale('commands:pvp.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${
        options[i].damage
      }**🗡️`;
      escolhas.push(i + 1);
    }

    const embed = new MessageEmbed()
      .setFooter(ctx.locale('commands:dungeon.battle.footer'))
      .setTitle(`${ctx.locale('commands:pvp.battle.title', { user: member1.tag })}`)
      .setColor('#f04682')
      .setDescription(texto);
    ctx.sendC(member1, embed);

    const filter = (m) => m.author.id === member1.id;
    const collector = ctx.message.channel.createMessageCollector(filter, {
      max: 1,
      time: 6800,
      errors: ['time'],
    });

    let time = false;

    collector.on('collect', (m) => {
      time = true;
      const choice = Number(m.content);
      if (escolhas.includes(choice)) {
        this.continueBattle(
          ctx,
          options[choice - 1],
          user1,
          user2,
          member1,
          member2,
          user1abilities,
          user2abilities,
          aposta,
          null,
        );
      } else {
        this.continueBattle(
          ctx,
          false,
          user1,
          user2,
          member1,
          member2,
          user1abilities,
          user2abilities,
          aposta,
          `⚔️ |  ${ctx.locale('commands:pvp.battle.newTecnique', { user: member1.tag })}`,
        );
      }
    });

    setTimeout(() => {
      if (!time) {
        this.continueBattle(
          ctx,
          false,
          user1,
          user2,
          member1,
          member2,
          user1abilities,
          user2abilities,
          aposta,
          `⚔️ |  ${ctx.locale('commands:pvp.battle.timeout', { user: member1.tag })}`,
        );
      }
    }, 7100);
  }

  async continueBattle(
    ctx,
    escolha,
    user1,
    user2,
    member1,
    member2,
    user1abilities,
    user2abilities,
    aposta,
    attackText,
  ) {
    let toSay;
    if (!attackText) {
      let danoUser = 0;
      if (escolha) {
        if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') {
          danoUser = escolha.damage;
        } else if (escolha.name === 'Morte Instantânea') {
          user1.life -= 50;
          return this.continueBattle(
            ctx,
            false,
            user1,
            user2,
            member1,
            member2,
            user1abilities,
            user2abilities,
            aposta,
            `⚔️ | ${ctx.locale('commands:pvp.battle.insta-kill', {
              user: member1.tag,
              user2: member2.tag,
            })}`,
          );
        } else {
          if (user1.mana < escolha.cost)
            return this.continueBattle(
              ctx,
              false,
              user1,
              user2,
              member1,
              member2,
              user1abilities,
              user2abilities,
              aposta,
              `⚔️ | ${ctx.locale('commands:pvp.battle.no-mana', {
                name: escolha.name,
                user: member1.tag,
                user2: member2.tag,
              })}`,
            );
          if (escolha.heal > 0) {
            user1.life += escolha.heal;
            if (user1.life > user1.maxLife) user1.life = user1.maxLife;
          }
          danoUser =
            user1?.familiar?.id && user1.familiar.type === 'abilityPower'
              ? escolha.damage *
                (user1.abilityPower +
                  familiarsFile[user1.familiar.id].boost.value +
                  (user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)
              : user1.abilityPower * escolha.damage;
          user1.mana -= escolha.cost;
        }
      }

      const enemyArmor =
        user2?.familiar?.id && user2.familiar.type === 'armor'
          ? user2.armor +
            (familiarsFile[user2.familiar.id]?.boost.value +
              (user2.familiar.level - 1) * familiarsFile[user1.familiar.id]?.boost.value)
          : user2.armor;
      let danoDado = danoUser - enemyArmor;
      if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') danoDado = danoUser;
      if (danoDado < 0) danoDado = 0;
      user2.life -= danoDado;

      toSay = `⚔️ | ${ctx.locale('commands:pvp.battle.attack', {
        enemy: member2.tag,
        choice: escolha.name,
        damage: danoDado,
        user: member1.tag,
      })}`;
    }

    if (user2.life < 1) {
      return this.endBattle(ctx, user1, user2, member1, member2, aposta, attackText || toSay);
    }

    if (user1.life < 1) {
      return this.endBattle(ctx, user2, user1, member2, member1, aposta, attackText || toSay);
    }

    const options = [];

    options.push({
      name: ctx.locale('commands:dungeon.battle.basic'),
      damage:
        user2?.familiar?.id && user2.familiar.type === 'damage'
          ? user2.damage +
            user2.weapon.damage +
            (familiarsFile[user2.familiar.id].boost.value +
              (user2.familiar.level - 1) * familiarsFile[user2.familiar.id].boost.value)
          : user2.damage + user2.weapon.damage,
    });

    options.push(...user2abilities);

    let texto = `${toSay || attackText}\n\n${ctx.locale(
      'commands:pvp.battle.enemy',
    )}\n❤️ | ${ctx.locale('commands:dungeon.life')}: **${user1.life}**\n⚔️ | ${ctx.locale(
      'commands:dungeon.damage',
    )}: **${user1.damage}**\n🛡️ | ${ctx.locale('commands:dungeon.armor')}: **${
      user1.armor
    }**\n\n${ctx.locale('commands:pvp.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${
        options[i].damage
      }**🗡️`;
      escolhas.push(i + 1);
    }

    const embed = new MessageEmbed()
      .setDescription(texto)
      .setColor('#f04682')
      .setTitle(`${ctx.locale('commands:pvp.battle.title', { user: member2.tag })}`)
      .setFooter(ctx.locale('commands:dungeon.battle.footer'));

    ctx.sendC(member2, embed);

    const filter = (m) => m.author.id === member2.id;
    const collector = ctx.message.channel.createMessageCollector(filter, {
      max: 1,
      time: 6800,
      errors: ['time'],
    });

    let time = false;

    collector.on('collect', (m) => {
      time = true;
      const choice = Number(m.content);
      if (escolhas.includes(choice)) {
        this.continueBattle(
          ctx,
          options[choice - 1],
          user2,
          user1,
          member2,
          member1,
          user2abilities,
          user1abilities,
          aposta,
          null,
        );
      } else {
        user2.life -= 50;
        this.continueBattle(
          ctx,
          false,
          user2,
          user1,
          member2,
          member1,
          user2abilities,
          user1abilities,
          aposta,
          `⚔️ |  ${ctx.locale('commands:pvp.battle.newTecnique', { user: member2.tag })}`,
        );
      }
    });

    setTimeout(() => {
      if (!time) {
        user2.life -= 50;
        this.continueBattle(
          ctx,
          false,
          user2,
          user1,
          member2,
          member1,
          user2abilities,
          user1abilities,
          aposta,
          `⚔️ |  ${ctx.locale('commands:pvp.battle.timeout', { user: member2.tag })}`,
        );
      }
    }, 7100);
  }

  async endBattle(ctx, user1, user2, member1, member2, aposta, toSay) {
    const text = `${toSay}\n${ctx.locale('commands:pvp.enough', { user: member2.tag })}`;
    const embed = new MessageEmbed()
      .setColor('#e905ff')
      .setDescription(text)
      .setTitle(ctx.locale('commands:pvp.battle.win', { user: member1.tag }));

    if (aposta) {
      user1.money += aposta;
      user2.money -= aposta;
      user1.inBattle = false;
      user2.inBattle = false;
      user2.death = Date.now() + 7200000;
      user2.life = 0;
      await user1.save();
      await user2.save();
      embed.addField(
        ctx.locale('commands:pvp.aposta'),
        ctx.locale('commands:pvp.aposta-description', { aposta, winner: member1.tag }),
      );
      return ctx.send(embed);
    }

    const findFirstUserWithoutAposta = await this.client.database.Rpg.findById(member1.id);
    const findSecondUserWithoutAposta = await this.client.database.Rpg.findById(member2.id);
    findFirstUserWithoutAposta.inBattle = false;
    findSecondUserWithoutAposta.inBattle = false;
    findFirstUserWithoutAposta.save();
    findSecondUserWithoutAposta.save();
    embed.addField(ctx.locale('commands:pvp.aposta'), ctx.locale('commands:pvp.not-aposta'));
    ctx.send(embed);
  }
}
