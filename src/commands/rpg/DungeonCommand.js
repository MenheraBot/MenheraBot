const { MessageEmbed } = require('discord.js');
const familiarsFile = require('../../structures/Rpgs/familiar.json');

const Command = require('../../structures/command');

module.exports = class DungeonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'dungeon',
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run(ctx) {
    const user = await this.client.database.Rpg.findById(ctx.message.author.id);
    if (!user) return ctx.replyT('error', 'commands:dungeon.non-aventure');

    if (!ctx.args[0]) return ctx.replyT('error', 'commands:dungeon.no-args');

    const polishedInput = ctx.args[0].replace(/\D+/g, '');

    if (!polishedInput) return ctx.replyT('error', 'commands:dungeon.no-args');

    const inimigo = await this.client.rpgChecks.getEnemyByUserLevel(user, 'dungeon', polishedInput, ctx);

    if (!inimigo) return ctx.replyT('error', 'commands:dungeon.no-level');

    if (inimigo === 'LOW-LEVEL') return;

    const canGo = await this.client.rpgChecks.initialChecks(user, ctx);

    if (!canGo) return;

    const dmgView = user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage;
    const ptcView = user?.familiar?.id && user.familiar.type === 'armor' ? user.armor + user.protection.armor + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.armor + user.protection.armor;

    const habilidades = await this.client.rpgChecks.getAbilities(user);

    const embed = new MessageEmbed()
      .setTitle(`⌛ | ${ctx.locale('commands:dungeon.preparation.title')}`)
      .setDescription(ctx.locale('commands:dungeon.preparation.description'))
      .setColor('#e3beff')
      .setFooter(ctx.locale('commands:dungeon.preparation.footer'))
      .addField(ctx.locale('commands:dungeon.preparation.stats'), `🩸 | **${ctx.locale('commands:dungeon.life')}:** ${user.life}/${user.maxLife}\n💧 | **${ctx.locale('commands:dungeon.mana')}:** ${user.mana}/${user.maxMana}\n🗡️ | **${ctx.locale('commands:dungeon.dmg')}:** ${dmgView}\n🛡️ | **${ctx.locale('commands:dungeon.armor')}:** ${ptcView}\n🔮 | **${ctx.locale('commands:dungeon.ap')}:** ${user?.familiar?.id && user.familiar.type === 'abilityPower' ? user.abilityPower + (familiarsFile[user.familiar.id].boost.value + (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value) : user.abilityPower}\n\n${ctx.locale('commands:dungeon.preparation.description_end')}`);
    habilidades.forEach((hab) => {
      embed.addField(hab.name, `🔮 | **${ctx.locale('commands:dungeon.damage')}:** ${hab.damage}\n💧 | **${ctx.locale('commands:dungeon.cost')}** ${hab.cost}`);
    });
    ctx.send(embed);

    const filter = (m) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        this.battle(ctx, inimigo, habilidades, user, 'dungeon');
      } else return ctx.replyT('error', 'commands:dungeon.arregou');
    });
  }

  async battle(ctx, inimigo, habilidades, user, type) {
    user.dungeonCooldown = this.client.constants.rpg.dungeonCooldown + Date.now();
    user.inBattle = true;
    await user.save();

    const options = [{
      name: ctx.locale('commands:dungeon.scape'),
      damage: '🐥',
      scape: true,
    }];

    options.push({
      name: ctx.locale('commands:dungeon.battle.basic'),
      damage: user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage,
    });

    habilidades.forEach((hab) => {
      options.push(hab);
    });

    let texto = `${ctx.locale('commands:dungeon.battle.enter', { type: inimigo.type, name: inimigo.name })}\n\n❤️ | ${ctx.locale('commands:dungeon.life')}: **${inimigo.life}**\n⚔️ | ${ctx.locale('commands:dungeon.damage')}: **${inimigo.damage}**\n🛡️ | ${ctx.locale('commands:dungeon.armor')}: **${inimigo.armor}**\n\n${ctx.locale('commands:dungeon.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`;
      escolhas.push(i);
    }

    const embed = new MessageEmbed()
      .setFooter(ctx.locale('commands:dungeon.battle.footer'))
      .setTitle(`${ctx.locale('commands:dungeon.battle.title')}${inimigo.name}`)
      .setColor('#f04682')
      .setDescription(texto);
    ctx.sendC(ctx.message.author, embed);

    const filter = (m) => m.author.id === ctx.message.author.id;
    const collector = ctx.message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ['time'] });

    let time = false;

    collector.on('collect', (m) => {
      time = true;
      const choice = Number(m.content);
      if (escolhas.includes(choice)) {
        this.client.rpgChecks.battle(ctx, options[choice], user, inimigo, type);
      } else {
        this.client.rpgChecks.enemyShot(ctx, user, inimigo, type, `⚔️ |  ${ctx.locale('commands:dungeon.battle.newTecnique')}`);
      }
    });

    setTimeout(() => {
      if (!time) {
        this.client.rpgChecks.enemyShot(ctx, user, inimigo, type, `⚔️ |  ${ctx.locale('commands:dungeon.battle.timeout')}`);
      }
    }, 15000);
  }
};
