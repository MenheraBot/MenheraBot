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

  async run({ message, args }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:dungeon.non-aventure'));

    if (!args[0]) return message.menheraReply('error', t('commands:dungeon.no-args'));

    const polishedInput = args[0].replace(/\D+/g, '');

    if (!polishedInput) return message.menheraReply('error', t('commands:dungeon.no-args'));

    const inimigo = await this.client.rpgChecks.getEnemyByUserLevel(user, 'dungeon', polishedInput, message, t);

    if (!inimigo) return message.menheraReply('error', t('commands:dungeon.no-level'));

    if (inimigo === 'LOW-LEVEL') return;

    const canGo = await this.client.rpgChecks.initialChecks(user, message, t);

    if (!canGo) return;

    const dmgView = user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage;
    const ptcView = user?.familiar?.id && user.familiar.type === 'armor' ? user.armor + user.protection.armor + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.armor + user.protection.armor;

    const habilidades = await this.client.rpgChecks.getAbilities(user);

    const embed = new MessageEmbed()
      .setTitle(`⌛ | ${t('commands:dungeon.preparation.title')}`)
      .setDescription(t('commands:dungeon.preparation.description'))
      .setColor('#e3beff')
      .setFooter(t('commands:dungeon.preparation.footer'))
      .addField(t('commands:dungeon.preparation.stats'), `🩸 | **${t('commands:dungeon.life')}:** ${user.life}/${user.maxLife}\n💧 | **${t('commands:dungeon.mana')}:** ${user.mana}/${user.maxMana}\n🗡️ | **${t('commands:dungeon.dmg')}:** ${dmgView}\n🛡️ | **${t('commands:dungeon.armor')}:** ${ptcView}\n🔮 | **${t('commands:dungeon.ap')}:** ${user?.familiar?.id && user.familiar.type === 'abilityPower' ? user.abilityPower + (familiarsFile[user.familiar.id].boost.value + (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value) : user.abilityPower}\n\n${t('commands:dungeon.preparation.description_end')}`);
    habilidades.forEach((hab) => {
      embed.addField(hab.name, `🔮 | **${t('commands:dungeon.damage')}:** ${hab.damage}\n💧 | **${t('commands:dungeon.cost')}** ${hab.cost}`);
    });
    message.channel.send(embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        this.battle(message, inimigo, habilidades, user, 'dungeon', t);
      } else return message.menheraReply('error', t('commands:dungeon.arregou'));
    });
  }

  async battle(message, inimigo, habilidades, user, type, t) {
    user.dungeonCooldown = this.client.constants.rpg.dungeonCooldown + Date.now();
    user.inBattle = true;
    await user.save();

    const options = [{
      name: t('commands:dungeon.scape'),
      damage: '🐥',
      scape: true,
    }];

    options.push({
      name: t('commands:dungeon.battle.basic'),
      damage: user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage,
    });

    habilidades.forEach((hab) => {
      options.push(hab);
    });

    let texto = `${t('commands:dungeon.battle.enter', { type: inimigo.type, name: inimigo.name })}\n\n❤️ | ${t('commands:dungeon.life')}: **${inimigo.life}**\n⚔️ | ${t('commands:dungeon.damage')}: **${inimigo.damage}**\n🛡️ | ${t('commands:dungeon.armor')}: **${inimigo.armor}**\n\n${t('commands:dungeon.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`;
      escolhas.push(i);
    }

    const embed = new MessageEmbed()
      .setFooter(t('commands:dungeon.battle.footer'))
      .setTitle(`${t('commands:dungeon.battle.title')}${inimigo.name}`)
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
        this.client.rpgChecks.battle(message, options[choice], user, inimigo, type, t);
      } else {
        this.client.rpgChecks.enemyShot(message, user, inimigo, type, t, `⚔️ |  ${t('commands:dungeon.battle.newTecnique')}`);
      }
    });

    setTimeout(() => {
      if (!time) {
        this.client.rpgChecks.enemyShot(message, user, inimigo, type, t, `⚔️ |  ${t('commands:dungeon.battle.timeout')}`);
      }
    }, 15000);
  }
};
