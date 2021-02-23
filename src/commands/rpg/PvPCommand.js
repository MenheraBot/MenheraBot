const { MessageEmbed } = require('discord.js');
const Command = require('../../structures/command');
const familiarsFile = require('../../structures/Rpgs/familiar.json');

module.exports = class PvPCommands extends Command {
  constructor(client) {
    super(client, {
      name: 'pvp',
      cooldown: 10,
      clientPermissions: ['EMBED_LINKS'],
      category: 'rpg',
    });
  }

  async run({ message, args }, t) {
    const mention = message.mentions.users.first();
    const valor = args[1];
    if (!mention) return message.menheraReply('error', t('commands:pvp.no-args'));

    if (mention.bot) return message.menheraReply('error', t('commands:pvp.bot'));

    if (mention === message.author) return message.menheraReply('error', t('comands:pvp.self-mention'));

    const user1 = await this.client.database.Rpg.findById(message.author.id);
    const user2 = await this.client.database.Rpg.findById(mention.id);

    if (!user1 || !user2) return message.menheraReply('error', t('commands:pvp.no-user'));

    const dmgView2 = user2?.familiar?.id && user2.familiar.type === 'damage' ? user2.damage + user2.weapon.damage + (familiarsFile[user2.familiar.id].boost.value + ((user2.familiar.level - 1) * familiarsFile[user2.familiar.id].boost.value)) : user2.damage + user2.weapon.damage;
    const ptcView2 = user2?.familiar?.id && user2.familiar.type === 'armor' ? user2.armor + user2.protection.armor + (familiarsFile[user2.familiar.id].boost.value + ((user2.familiar.level - 1) * familiarsFile[user2.familiar.id].boost.value)) : user2.armor + user2.protection.armor;
    const dmgView1 = user1?.familiar?.id && user1.familiar.type === 'damage' ? user1.damage + user1.weapon.damage + (familiarsFile[user1.familiar.id].boost.value + ((user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)) : user1.damage + user1.weapon.damage;
    const ptcView1 = user1?.familiar?.id && user1.familiar.type === 'armor' ? user1.armor + user1.protection.armor + (familiarsFile[user1.familiar.id].boost.value + ((user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)) : user1.armor + user1.protection.armor;

    const embed = new MessageEmbed()
      .setTitle(t('commands:pvp.accept-battle', { user: message.author.tag }))
      .setColor('#8bf1f0')
      .setFooter(t('commands:pvp.not-competitive'))
      .setDescription(`**${t('commands:pvp.your-status')}**\n\n🩸 | ** ${t('commands:dungeon.life')}:** ${user2.life} / ${user2.maxLife}\n💧 | ** ${t('commands:dungeon.mana')}:** ${user2.mana} / ${user2.maxMana}\n🗡️ | ** ${t('commands:dungeon.dmg')}:** ${dmgView2}\n🛡️ | ** ${t('commands:dungeon.armor')}:** ${ptcView2}\n🔮 | ** ${t('commands:dungeon.ap')}:** ${user2.abilityPower}\n\n**${t('commands:pvp.enemy-status', { user: message.author.tag })}**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🩸 | **${t('commands:dungeon.life')}:** ${user1.life} / ${user1.maxLife}\n💧 | ** ${t('commands:dungeon.mana')}:** ${user1.mana} / ${user1.maxMana}\n🗡️ | ** ${t('commands:dungeon.dmg')}:** ${dmgView1}\n🛡️ | ** ${t('commands:dungeon.armor')}:** ${ptcView1}\n🔮 | ** ${t('commands:dungeon.ap')}:** ${user1.abilityPower}\n-----------------------------\n ${t('commands:pvp.send-to-accept')}`);

    let aposta = false;

    if (valor) {
      if (user1.life <= 0 || user2.life <= 0) return message.menheraReply('error', t('commands:pvp.no-life'));
      aposta = parseInt(valor.replace(/\D+/g, ''));
      if (Number.isNaN(aposta)) return message.menheraReply('error', t('commands:pvp.invalid-value'));
      if (aposta <= 0) return message.menheraReply('error', t('commands:pvp.invalid-value'));
      if (aposta > user1.money) return message.menheraReply('error', t('commands:pvp.you-poor'));
      if (aposta > user2.money) return message.menheraReply('error', t('commands:pvp.his-poor', { user: mention.tag }));
      embed.setColor('RED');
      embed.setFooter(t('commands:pvp.is-competitive', { aposta }));
    }

    if (user1.inBattle) return message.menheraReply('error', t('commands:pvp.in-battle-one'));
    if (user2.inBattle) return message.menheraReply('error', t('commands:pvp.in-battle-two'));

    if (!aposta) embed.setDescription(`**${t('commands:pvp.your-status')}**\n\n🩸 | ** ${t('commands:dungeon.life')}:** ${user2.maxLife}\n💧 | ** ${t('commands:dungeon.mana')}:** ${user2.maxMana}\n🗡️ | ** ${t('commands:dungeon.dmg')}:** ${dmgView2}\n🛡️ | ** ${t('commands:dungeon.armor')}:** ${ptcView2}\n🔮 | ** ${t('commands:dungeon.ap')}:** ${user2.abilityPower}\n\n**${t('commands:pvp.enemy-status', { user: message.author.tag })}**\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n🩸 | **${t('commands:dungeon.life')}:** ${user1.maxLife}\n💧 | ** ${t('commands:dungeon.mana')}:** ${user1.maxMana}\n🗡️ | ** ${t('commands:dungeon.dmg')}:** ${dmgView1}\n🛡️ | ** ${t('commands:dungeon.armor')}:** ${ptcView1}\n🔮 | ** ${t('commands:dungeon.ap')}:** ${user1.abilityPower}\n-----------------------------\n ${t('commands:pvp.send-to-accept')}`);

    message.channel.send(mention, embed);

    const acceptFilter = (m) => m.author.id === mention.id;
    const acceptCollector = message.channel.createMessageCollector(acceptFilter, { max: 1, time: 10000, errors: ['time'] });

    acceptCollector.on('collect', async (m) => {
      if (m.content.toLowerCase() === 'sim' || m.content.toLowerCase() === 'yes') {
        user1.inBattle = true;
        user2.inBattle = true;
        await user1.save();
        await user2.save();

        return this.makeBattle(user1, user2, message.author, mention, aposta, message, t);
      }

      return message.menheraReply('error', t('commands:pvp.negated', { user: mention.tag }));
    });
  }

  async makeBattle(user1, user2, member1, member2, aposta, message, t) {
    const options = [];

    if (!aposta) {
      user1.life = user1.maxLife;
      user1.mana = user1.maxMana;
      user2.life = user2.maxLife;
      user2.mana = user2.maxMana;
    }

    options.push({
      name: t('commands:dungeon.battle.basic'),
      damage: user1?.familiar?.id && user1.familiar.type === 'damage' ? user1.damage + user1.weapon.damage + (familiarsFile[user1.familiar.id].boost.value + ((user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)) : user1.damage + user1.weapon.damage,
    });

    const user1abilities = await this.client.rpgChecks.getAbilities(user1);
    const user2abilities = await this.client.rpgChecks.getAbilities(user2);

    options.push(...user1abilities);

    let texto = `${t('commands:pvp.battle.enter', { user1: member1.tag, user2: member2.tag })}\n\n❤️ | ${t('commands:dungeon.life')}: **${user2.life}**\n⚔️ | ${t('commands:dungeon.damage')}: **${user2.damage}**\n🛡️ | ${t('commands:dungeon.armor')}: **${user2.armor}**\n\n${t('commands:pvp.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`;
      escolhas.push(i + 1);
    }

    const embed = new MessageEmbed()
      .setFooter(t('commands:dungeon.battle.footer'))
      .setTitle(`${t('commands:pvp.battle.title', { user: member1.tag })}`)
      .setColor('#f04682')
      .setDescription(texto);
    message.channel.send(member1, embed);

    const filter = (m) => m.author.id === member1.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 7000, errors: ['time'] });

    let time = false;

    collector.on('collect', (m) => {
      time = true;
      const choice = Number(m.content);
      if (escolhas.includes(choice)) {
        this.continueBattle(message, options[choice - 1], user1, user2, member1, member2, user1abilities, user2abilities, aposta, t, null);
      } else {
        this.continueBattle(message, false, user1, user2, member1, member2, user1abilities, user2abilities, aposta, t, `⚔️ |  ${t('commands:pvp.battle.newTecnique', { user: member1.tag })}`);
      }
    });

    setTimeout(() => {
      if (!time) {
        this.continueBattle(message, false, user1, user2, member1, member2, user1abilities, user2abilities, aposta, t, `⚔️ |  ${t('commands:pvp.battle.timeout', { user: member1.tag })}`);
      }
    }, 7000);
  }

  async continueBattle(message, escolha, user1, user2, member1, member2, user1abilities, user2abilities, aposta, t, attackText) {
    let toSay;
    if (!attackText) {
      let danoUser = 0;
      if (escolha) {
        if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') {
          danoUser = escolha.damage;
        } else if (escolha.name === 'Morte Instantânea') {
          user1.life -= 50;
          return this.continueBattle(message, false, user1, user2, member1, member2, user1abilities, user2abilities, aposta, t, `⚔️ | ${t('commands:pvp.battle.insta-kill', { user: member1.tag, user2: member2.tag })}`);
        } else {
          if (user1.mana < escolha.cost) return this.continueBattle(message, false, user1, user2, member1, member2, user1abilities, user2abilities, aposta, t, `⚔️ | ${t('commands:pvp.battle.no-mana', { name: escolha.name, user: member1.tag, user2: member2.tag })}`);
          if (escolha.heal > 0) {
            user1.life += escolha.heal;
            if (user1.life > user1.maxLife) user1.life = user1.maxLife;
          }
          danoUser = user1?.familiar?.id && user1.familiar.type === 'abilityPower' ? escolha.damage * (user1.abilityPower + familiarsFile[user1.familiar.id].boost.value + ((user1.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)) : user1.abilityPower * escolha.damage;
          user1.mana -= escolha.cost;
        }
      }

      const enemyArmor = user2?.familiar?.id && user2.familiar.type === 'armor' ? user2.armor + (familiarsFile[user2.familiar.id].boost.value + ((user2.familiar.level - 1) * familiarsFile[user1.familiar.id].boost.value)) : user2.armor;
      let danoDado = danoUser - enemyArmor;
      if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') danoDado = danoUser;
      if (danoDado < 0) danoDado = 0;
      user2.life -= danoDado;

      toSay = `⚔️ | ${t('commands:pvp.battle.attack', {
        enemy: member2.tag, choice: escolha.name, damage: danoDado, user: member1.tag,
      })}`;
    }

    if (user2.life < 1) {
      return this.endBattle(message, user1, user2, member1, member2, aposta, t, (attackText || toSay));
    }

    if (user1.life < 1) {
      return this.endBattle(message, user2, user1, member2, member1, aposta, t, (attackText || toSay));
    }

    const options = [];

    options.push({
      name: t('commands:dungeon.battle.basic'),
      damage: user2?.familiar?.id && user2.familiar.type === 'damage' ? user2.damage + user2.weapon.damage + (familiarsFile[user2.familiar.id].boost.value + ((user2.familiar.level - 1) * familiarsFile[user2.familiar.id].boost.value)) : user2.damage + user2.weapon.damage,
    });

    options.push(...user2abilities);

    let texto = `${(toSay || attackText)}\n\n${t('commands:pvp.battle.enemy')}\n❤️ | ${t('commands:dungeon.life')}: **${user1.life}**\n⚔️ | ${t('commands:dungeon.damage')}: **${user1.damage}**\n🛡️ | ${t('commands:dungeon.armor')}: **${user1.armor}**\n\n${t('commands:pvp.battle.end')}`;

    const escolhas = [];

    for (let i = 0; i < options.length; i++) {
      texto += `\n**${i + 1}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`;
      escolhas.push(i + 1);
    }

    const embed = new MessageEmbed()
      .setDescription(texto)
      .setColor('#f04682')
      .setTitle(`${t('commands:pvp.battle.title', { user: member2.tag })}`)
      .setFooter(t('commands:dungeon.battle.footer'));

    message.channel.send(member2, embed);

    const filter = (m) => m.author.id === member2.id;
    const collector = message.channel.createMessageCollector(filter, { max: 1, time: 7000, errors: ['time'] });

    let time = false;

    collector.on('collect', (m) => {
      time = true;
      const choice = Number(m.content);
      if (escolhas.includes(choice)) {
        this.continueBattle(message, options[choice - 1], user2, user1, member2, member1, user2abilities, user1abilities, aposta, t, null);
      } else {
        user2.life -= 50;
        this.continueBattle(message, false, user2, user1, member2, member1, user2abilities, user1abilities, aposta, t, `⚔️ |  ${t('commands:pvp.battle.newTecnique', { user: member2.tag })}`);
      }
    });

    setTimeout(() => {
      if (!time) {
        user2.life -= 50;
        this.continueBattle(message, false, user2, user1, member2, member1, user2abilities, user1abilities, aposta, t, `⚔️ |  ${t('commands:pvp.battle.timeout', { user: member2.tag })}`);
      }
    }, 7000);
  }

  async endBattle(message, user1, user2, member1, member2, aposta, t, toSay) {
    const text = `${toSay}\n${t('commands:pvp.enough', { user: member2.tag })}`;
    const embed = new MessageEmbed()
      .setColor('#e905ff')
      .setDescription(text)
      .setTitle(t('commands:pvp.battle.win', { user: member1.tag }));

    if (aposta) {
      user1.money += aposta;
      user2.money -= aposta;
      user1.inBattle = false;
      user2.inBattle = false;
      user2.death = Date.now() + 7200000;
      user2.life = 0;
      await user1.save();
      await user2.save();
      embed.addField(t('commands:pvp.aposta'), t('commands:pvp.aposta-description', { aposta, winner: member1.tag }));
      return message.channel.send(embed);
    }

    const findFirstUserWithoutAposta = await this.client.database.Rpg.findById(member1.id);
    const findSecondUserWithoutAposta = await this.client.database.Rpg.findById(member2.id);
    findFirstUserWithoutAposta.inBattle = false;
    findSecondUserWithoutAposta.inBattle = false;
    findFirstUserWithoutAposta.save();
    findSecondUserWithoutAposta.save();
    embed.addField(t('commands:pvp.aposta'), t('commands:pvp.not-aposta'));
    message.channel.send(embed);
  }
};
