const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const familiarsFile = require('../../structures/Rpgs/familiar.json');

module.exports = class BattleBoss extends Command {
  constructor(client) {
    super(client, {
      name: 'boss',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.creplyT('error', 'commands:boss.non-aventure');

    if (user.level < 20) return ctx.replyT('error', 'commands:boss.min-level');

    const inimigo = this.client.rpgChecks.getEnemyByUserLevel(user, 'boss');
    const canGo = await this.client.rpgChecks.initialChecks(user, ctx.message, ctx.locale);

    if (!canGo) return;

    const dmgView = user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage;
    const ptcView = user?.familiar?.id && user.familiar.type === 'armor' ? user.armor + user.protection.armor + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.armor + user.protection.armor;

    const habilidades = await this.client.rpgChecks.getAbilities(user);

    if (user.uniquePower.name === 'Morte Instantânea') {
      habilidades.splice(habilidades.findIndex((i) => i.name === 'Morte Instantânea'), 1);
    }

    const embed = new MessageEmbed()
      .setTitle(`⌛ | ${ctx.locale('commands:boss.preparation.title')}`)
      .setDescription(ctx.locale('commands:boss.preparation.description'))
      .setColor('#e3beff')
      .setFooter(ctx.locale('commands:boss.preparation.footer'))
      .addField(ctx.locale('commands:boss.preparation.stats'), `🩸 | **${ctx.locale('commands:boss.life')}:** ${user.life}/${user.maxLife}\n💧 | **${ctx.locale('commands:boss.mana')}:** ${user.mana}/${user.maxMana}\n🗡️ | **${ctx.locale('commands:boss.dmg')}:** ${dmgView}\n🛡️ | **${ctx.locale('commands:boss.armor')}:** ${ptcView}\n🔮 | **${ctx.locale('commands:boss.ap')}:** ${user?.familiar?.id && user.familiar.type === 'abilityPower' ? user.abilityPower + (familiarsFile[user.familiar.id].boost.value + (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value) : user.abilityPower}\n\n${ctx.locale('commands:boss.preparation.description_end')}`);
    habilidades.forEach((hab) => {
      embed.addField(hab.name, `🔮 | **${ctx.locale('commands:boss.damage')}:** ${hab.damage}\n💧 | **${ctx.locale('commands:boss.cost')}** ${hab.cost}`);
    });
    ctx.send(embed);

    const filter = (m) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        this.battle(ctx.message, inimigo, habilidades, user, 'boss', ctx.locale);
      } else return ctx.replyT('error', 'commands:boss.amarelou');
    });
  }

  async battle(message, inimigo, habilidades, user, type, t) {
    user.dungeonCooldown = this.client.constants.rpg.bossCooldown + Date.now();
    user.inBattle = true;
    await user.save();

    const options = [{
      name: t('commands:dungeon.scape'),
      damage: '🐥',
      scape: true,
    }];

    options.push({
      name: t('commands:boss.battle.basic'),
      damage: user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage,
    });

    habilidades.forEach((hab) => {
      options.push(hab);
    });

    let texto = `${t('commands:boss.battle.enter', { enemy: inimigo.name })}\n\n❤️ | ${t('commands:boss.life')}: **${inimigo.life}**\n⚔️ | ${t('commands:boss.damage')}: **${inimigo.damage}**\n🛡️ | ${t('commands:boss.armor')}: **${inimigo.armor}**\n\n${t('commands:boss.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`;
      escolhas.push(i);
    }

    const embed = new MessageEmbed()
      .setFooter(t('commands:boss.battle.footer'))
      .setTitle(`BossBattle: ${inimigo.name}`)
      .setColor('#f04682')
      .setDescription(texto);
    message.channel.send(message.author, embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ['time'] });

    let time = false;

    collector.on('collect', (m) => {
      time = true;
      const choice = Number(m.content);
      if (escolhas.includes(choice)) {
        return this.client.rpgChecks.battle(message, options[choice], user, inimigo, type, t);
      }
      return this.client.rpgChecks.enemyShot(message, user, inimigo, type, t, `⚔️ |  ${t('commands:boss.battle.newTecnique')}`);
    });

    setTimeout(() => {
      if (!time) {
        return this.client.rpgChecks.enemyShot(message, user, inimigo, type, t, `⚔️ |  ${t('commands:boss.battle.timeout')}`);
      }
    }, 15000);
  }
};
