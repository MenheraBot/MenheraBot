const { MessageEmbed } = require('discord.js');
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

  async run({ message }, t) {
    const user = await this.client.database.Rpg.findById(message.author.id);
    if (!user) return message.menheraReply('error', t('commands:dungeon.non-aventure'));

    const inimigo = this.client.rpgChecks.getEnemyByUserLevel(user, 'dungeon');

    const canGo = await this.client.rpgChecks.initialChecks(user, message, t);

    if (!canGo) return;

    let familia;
    let dmgView = user.damage + user.weapon.damage;
    let ptcView = user.armor + user.protection.armor;

    if (user.hasFamily) {
      familia = await this.client.database.Familias.findById(user.familyName);
      if (user.familyName === 'Loki') dmgView = user.damage + user.weapon.damage + familia.boost.value;
      if (user.familyName === 'Ares') ptcView = user.armor + user.protection.armor + familia.boost.value;
    }

    const habilidades = await this.client.rpgChecks.getAbilities(user, familia);

    if (!inimigo) return message.menheraReply('error', t('commands:dungeon.no-enemy'));

    const embed = new MessageEmbed()
      .setTitle(`⌛ | ${t('commands:dungeon.preparation.title')}`)
      .setDescription(t('commands:dungeon.preparation.description'))
      .setColor('#e3beff')
      .setFooter(t('commands:dungeon.preparation.footer'))
      .addField(t('commands:dungeon.preparation.stats'), `🩸 | **${t('commands:dungeon.life')}:** ${user.life}/${user.maxLife}\n💧 | **${t('commands:dungeon.mana')}:** ${user.mana}/${user.maxMana}\n🗡️ | **${t('commands:dungeon.dmg')}:** ${dmgView}\n🛡️ | **${t('commands:dungeon.armor')}:** ${ptcView}\n🔮 | **${t('commands:dungeon.ap')}:** ${user.abilityPower}\n\n${t('commands:dungeon.preparation.description_end')}`);
    habilidades.forEach((hab) => {
      embed.addField(hab.name, `🔮 | **${t('commands:dungeon.damage')}:** ${hab.damage}\n💧 | **${t('commands:dungeon.cost')}** ${hab.cost}`);
    });
    message.channel.send(embed);

    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 30000, errors: ['time'] });

    collector.on('collect', (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        this.battle(message, inimigo, habilidades, user, 'dungeon', familia, t);
      } else return message.menheraReply('error', t('commands:dungeon.arregou'));
    });
  }

  async battle(message, inimigo, habilidades, user, type, familia, t) {
    user.dungeonCooldown = 3600000 + Date.now();
    user.inBattle = true;
    user.save();

    const options = [];

    if (user.hasFamily && user.familyName === 'Loki') {
      options.push({
        name: t('commands:dungeon.battle.basic'),
        damage: user.damage + user.weapon.damage + familia.boost.value,
      });
    } else {
      options.push({
        name: t('commands:dungeon.battle.basic'),
        damage: user.damage + user.weapon.damage,
      });
    }

    habilidades.forEach((hab) => {
      options.push(hab);
    });

    let texto = `${t('commands:dungeon.battle.enter', { type: inimigo.type, name: inimigo.name })}\n\n❤️ | ${t('commands:dungeon.life')}: **${inimigo.life}**\n⚔️ | ${t('commands:dungeon.damage')}: **${inimigo.damage}**\n🛡️ | ${t('commands:dungeon.armor')}: **${inimigo.armor}**\n\n${t('commands:dungeon.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`;
      escolhas.push(i + 1);
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
        this.client.rpgChecks.battle(message, options[choice - 1], user, inimigo, type, familia, t);
      } else {
        this.client.rpgChecks.enemyShot(message, user, inimigo, type, familia, t, `⚔️ |  ${t('commands:dungeon.battle.newTecnique')}`);
      }
    });

    setTimeout(() => {
      if (!time) {
        this.client.rpgChecks.enemyShot(message, user, inimigo, type, familia, t, `⚔️ |  ${t('commands:dungeon.battle.timeout')}`);
      }
    }, 15000);
  }
};
