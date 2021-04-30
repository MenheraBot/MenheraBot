const moment = require('moment');
const { MessageEmbed } = require('discord.js');
const RPGUtil = require('../../utils/RPGUtil');
const mobsFile = require('../RpgHandler').mobs;
const abilitiesFile = require('../RpgHandler').abiltiies;
const familiarsFile = require('../RpgHandler').familiars;
const http = require('../../utils/HTTPrequests');

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports.getEnemyByUserLevel = (user, type, dungeonLevel, message, t) => {
  if (type === 'boss') {
    if (user.level > 24 && user.level < 30) {
      return random([...mobsFile.boss, ...mobsFile.gods]);
    }
    if (user.level >= 30) {
      return random([...mobsFile.gods, ...mobsFile.universal]);
    }
    return random(mobsFile.boss);
  }

  const validLevels = {
    1: {
      minUserLevel: 0,
      mob: random(mobsFile.inicial),
    },
    2: {
      minUserLevel: 4,
      mob: random(mobsFile.medio),
    },
    3: {
      minUserLevel: 9,
      mob: random(mobsFile.hard),
    },
    4: {
      minUserLevel: 13,
      mob: random(mobsFile.impossible),
    },
    5: {
      minUserLevel: 30,
      mob: random(mobsFile.evolved),
    },
  };

  if (!dungeonLevel) return false;

  if (!validLevels[dungeonLevel]) return false;

  if (user.level < validLevels[dungeonLevel].minUserLevel) {
    message.menheraReply('error', t('commands:dungeon.min-level-warn'));
    return 'LOW-LEVEL';
  }

  return validLevels[dungeonLevel].mob;
};

module.exports.battle = async (message, escolha, user, inimigo, type, t) => {
  let danoUser;
  if (escolha.scape) {
    message.menheraReply('scape', t('roleplay:scape'));
    user.inBattle = false;
    user.dungeonCooldown = 7200000 + Date.now();
    await user.save();
    return;
  }
  if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') {
    danoUser = escolha.damage;
  } else if (escolha.name === 'Morte Instantânea') {
    if (user.mana < user.maxMana) return this.enemyShot(message, user, inimigo, type, t, `⚔️ | ${t('roleplay:battle.no-mana', { name: escolha.name })}`);
    danoUser = inimigo.life / 2;
    user.mana = 0;
  } else {
    if (user.mana < escolha.cost) return this.enemyShot(message, user, inimigo, type, t, `⚔️ | ${t('roleplay:battle.no-mana', { name: escolha.name })}`);
    if (escolha.heal > 0) {
      user.life += escolha.heal;
      if (user.life > user.maxLife) user.life = user.maxLife;
    }
    danoUser = user?.familiar?.id && user.familiar.type === 'abilityPower' ? escolha.damage * (user.abilityPower + familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.abilityPower * escolha.damage;
    user.mana -= escolha.cost;
  }

  const enemyArmor = inimigo.armor;
  let danoDado = danoUser - enemyArmor;
  if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') danoDado = danoUser;
  if (danoDado < 0) danoDado = 0;
  const vidaInimigo = inimigo.life - danoDado;

  const toSay = `⚔️ | ${t('roleplay:battle.attack', { enemy: inimigo.name, choice: escolha.name, damage: danoDado })}`;

  if (vidaInimigo < 1) {
    return this.resultBattle(message, user, inimigo, t, toSay);
  }

  const enemy = {
    name: inimigo.name,
    damage: inimigo.damage,
    life: vidaInimigo,
    armor: inimigo.armor,
    loots: inimigo.loots,
    xp: inimigo.xp,
    ataques: inimigo.ataques,
    dgLevel: inimigo.dgLevel,
  };

  return this.enemyShot(message, user, enemy, type, t, toSay);
};

module.exports.morte = async (message, user, t, toSay, inimigo) => {
  http.postRpg(user.id, user.class, user.level, inimigo.dgLevel, true, Date.now());

  message.menheraReply('error', `${toSay}\n\n${t('roleplay:death')}`);
  user.death = Date.now() + 43200000;
  user.life = 0;
  user.inBattle = false;
  try {
    await user.save();
  } catch (e) {
    setTimeout(async () => {
      await user.save();
    }, 1000);
  }
};

module.exports.enemyShot = async (message, user, inimigo, type, t, toSay) => {
  const habilidades = await this.getAbilities(user);

  let danoRecebido;
  const armadura = user?.familiar?.id && user.familiar.type === 'armor' ? user.armor + user.protection.armor + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.armor + user.protection.armor;

  const ataque = await inimigo.ataques[Math.floor(Math.random() * inimigo.ataques.length)];

  if ((ataque.damage - armadura) < 5) {
    danoRecebido = 5;
  } else {
    danoRecebido = ataque.damage - armadura;
  }
  const vidaUser = user.life - danoRecebido;

  if (vidaUser < 1) {
    return this.morte(message, user, t, toSay, inimigo);
  }
  user.life = vidaUser;
  this.continueBattle(message, inimigo, habilidades, user, type, ataque, t, toSay);
};

module.exports.continueBattle = async (
  message, inimigo, habilidades, user, type, ataque, t, toSay,
) => {
  const options = [{
    name: t('commands:dungeon.scape'),
    damage: '🐥',
    scape: true,
  }];

  options.push({
    name: t('roleplay:basic-attack'),
    damage: user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage,
  });

  if (type === 'boss') {
    if (user.uniquePower.name === 'Morte Instantânea') {
      habilidades.splice(habilidades.findIndex((i) => i.name === 'Morte Instantânea'), 1);
    }
  }
  habilidades.forEach((hab) => {
    options.push(hab);
  });

  const dmgView = user?.familiar?.id && user.familiar.type === 'damage' ? user.damage + user.weapon.damage + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.damage + user.weapon.damage;
  const ptcView = user?.familiar?.id && user.familiar.type === 'armor' ? user.armor + user.protection.armor + (familiarsFile[user.familiar.id].boost.value + ((user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)) : user.armor + user.protection.armor;

  let damageReceived = ataque.damage - ptcView;
  if (damageReceived < 5) damageReceived = 5;

  let texto = t('roleplay:battle.text', {
    enemy: inimigo.name,
    attack: ataque.name,
    dmg: damageReceived,
    life: user.life,
    mana: user.mana,
    damage: dmgView,
    armor: ptcView,
    elife: inimigo.life,
    edmg: inimigo.damage,
    earmor: inimigo.armor,
  });

  const escolhas = [];

  for (let i = 0; i < options.length; i += 1) {
    texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${options[i].damage}**🗡️`;
    escolhas.push(i);
  }

  const embed = new MessageEmbed()
    .setFooter(t('roleplay:battle.footer'))
    .setColor('#f04682')
    .setDescription(texto);
  message.channel.send(toSay, embed);

  const filter = (m) => m.author.id === message.author.id;
  const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ['time'] });

  let time = false;

  collector.on('collect', (m) => {
    time = true;
    const choice = Number(m.content);
    if (escolhas.includes(choice)) {
      return this.battle(
        message, options[choice], user, inimigo, type, t,
      ); // Mandar os dados de ataque, e defesa do inimigo, para fazer o calculo lá
    }
    return this.enemyShot(message, user, inimigo, type, t, `⚔️ |  ${t('roleplay:battle.new-tatic')}`);
  });

  setTimeout(() => {
    if (!time) {
      return this.enemyShot(message, user, inimigo, type, t, `⚔️ | ${t('roleplay:battle.timeout')}`);
    }
  }, 15000);
};

module.exports.finalChecks = async (message, user, t) => {
  let texto = '';

  setTimeout(async () => {
    if (user.level < 5) {
      if (user.xp >= user.nextLevelXp) {
        user.xp = 0;
        user.nextLevelXp *= 2;
        user.level += 1;
        user.maxLife += 10;
        user.maxMana += 10;
        user.damage += 3;
        user.armor += 2;
        texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
        await user.save();
        message.channel.send(texto);
        this.newAbilities(message, user, t);
      }
    } else if (user.level > 4 && user.level < 10) {
      if (user.xp >= user.nextLevelXp) {
        user.nextLevelXp *= 2;
        user.level += 1;
        user.maxLife += 20;
        user.maxMana += 15;
        user.damage += 5;
        user.armor += 3;
        texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
        message.channel.send(texto);
        await user.save();
        this.newAbilities(message, user, t);
      }
    } else if (user.level > 9 && user.level < 29) {
      if (user.xp >= user.nextLevelXp) {
        user.nextLevelXp *= 2;
        user.level += 1;
        user.maxLife += 50;
        user.maxMana += 20;
        user.damage += 7;
        user.armor += 5;
        texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
        message.channel.send(texto);
        await user.save();
        this.newAbilities(message, user, t);
      }
    } else if (user.level >= 29) {
      if (user.xp >= user.nextLevelXp) {
        user.nextLevelXp *= 2;
        user.level += 1;
        user.maxLife += 50;
        user.maxMana += 50;
        user.damage += 10;
        user.armor += 2;
        texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
        message.channel.send(texto);
        await user.save();
        this.newAbilities(message, user, t);
      }
    }
  }, 500);
};

module.exports.newAbilities = async (message, user, t) => {
  setTimeout(async () => {
    if (user.level === 5) {
      switch (user.class) {
        case 'Assassino':
          user.abilities.push(abilitiesFile.assassin.normalAbilities[1]);
          user.maxMana += 20;
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.assassin.normalAbilities[1].name }));
          break;
        case 'Bárbaro':
          user.abilities.push(abilitiesFile.barbarian.normalAbilities[1]);
          user.maxLife += 20;
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.barbarian.normalAbilities[1].name }));
          break;
        case 'Clérigo':
          user.abilities.push(abilitiesFile.clerigo.normalAbilities[1]);
          user.abilityPower += 1;
          user.maxMana += 20;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.clerigo.normalAbilities[1].name }));
          break;
        case 'Druida':
          user.abilities.push(abilitiesFile.druida.normalAbilities[1]);
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.druida.normalAbilities[1].name }));
          break;
        case 'Espadachim':
          user.abilities.push(abilitiesFile.espadachim.normalAbilities[1]);
          user.abilityPower += 2;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.espadachim.normalAbilities[1].name }));
          break;
        case 'Feiticeiro':
          if (user.uniquePower.name === 'Linhagem: Mística') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[1]);
            user.maxMana += 20;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[1].name }));
          }
          if (user.uniquePower.name === 'Linhagem: Dracônica') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[2]);
            user.maxMana += 20;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[2].name }));
          }
          if (user.uniquePower.name === 'Linhagem: Demoníaca') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[3]);
            user.maxMana += 20;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[3].name }));
          }
          break;
        case 'Monge':
          user.abilities.push(abilitiesFile.monge.normalAbilities[1]);
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.monge.normalAbilities[1].name }));
          break;
        case 'Necromante':
          user.abilities.push(abilitiesFile.necromante.normalAbilities[1]);
          user.maxMana += 20;
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.necromante.normalAbilities[1].name }));
          break;
        default:
          break;
      }
    } else if (user.level === 10) {
      switch (user.class) {
        case 'Assassino':
          user.abilities.push(abilitiesFile.assassin.normalAbilities[2]);
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.assassin.normalAbilities[2].name }));
          break;
        case 'Bárbaro':
          user.abilities.push(abilitiesFile.barbarian.normalAbilities[2]);
          user.maxLife += 50;
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.barbarian.normalAbilities[2].name }));
          break;
        case 'Clérigo':
          user.abilities.push(abilitiesFile.clerigo.normalAbilities[2]);
          user.abilityPower += 1;
          user.maxMana += 20;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.clerigo.normalAbilities[2].name }));
          break;
        case 'Druida':
          user.abilities.push(abilitiesFile.druida.normalAbilities[2]);
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.druida.normalAbilities[2].name }));
          break;
        case 'Espadachim':
          user.abilities.push(abilitiesFile.espadachim.normalAbilities[2]);
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.espadachim.normalAbilities[2].name }));
          break;
        case 'Feiticeiro':
          if (user.uniquePower.name === 'Linhagem: Mística') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[4]);
            user.maxMana += 25;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[4].name }));
          }
          if (user.uniquePower.name === 'Linhagem: Dracônica') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[5]);
            user.maxMana += 25;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[5].name }));
          }
          if (user.uniquePower.name === 'Linhagem: Demoníaca') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[6]);
            user.maxMana += 25;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[6].name }));
          }
          break;
        case 'Monge':
          user.abilities.push(abilitiesFile.monge.normalAbilities[2]);
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.monge.normalAbilities[2].name }));
          break;
        case 'Necromante':
          user.abilities.push(abilitiesFile.necromante.normalAbilities[2]);
          user.maxMana += 25;
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.necromante.normalAbilities[2].name }));
          break;
        default:
          break;
      }
    } else if (user.level === 14) {
      switch (user.class) {
        case 'Assassino':
          user.abilities.push(abilitiesFile.assassin.normalAbilities[3]);
          user.abilityPower += 1;
          user.damage += 10;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.assassin.normalAbilities[3].name }));
          break;
        case 'Bárbaro':
          user.abilities.push(abilitiesFile.barbarian.normalAbilities[3]);
          user.maxLife += 50;
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.barbarian.normalAbilities[3].name }));
          break;
        case 'Clérigo':
          user.abilities.push(abilitiesFile.clerigo.normalAbilities[3]);
          user.abilityPower += 1;
          user.maxMana += 40;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.clerigo.normalAbilities[3].name }));
          break;
        case 'Druida':
          user.abilities.push(abilitiesFile.druida.normalAbilities[3]);
          user.abilityPower += 1;
          user.maxMana += 30;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.druida.normalAbilities[3].name }));
          break;
        case 'Espadachim':
          user.abilities.push(abilitiesFile.espadachim.normalAbilities[3]);
          user.abilityPower += 1;
          user.damage += 10;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.espadachim.normalAbilities[3].name }));
          break;
        case 'Feiticeiro':
          if (user.uniquePower.name === 'Linhagem: Mística') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[7]);
            user.maxMana += 40;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[7].name }));
          }
          if (user.uniquePower.name === 'Linhagem: Dracônica') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[8]);
            user.maxMana += 40;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[8].name }));
          }
          if (user.uniquePower.name === 'Linhagem: Demoníaca') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[9]);
            user.maxMana += 40;
            user.abilityPower += 1;
            await user.save();
            message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.feiticeiro.normalAbilities[9].name }));
          }
          break;
        case 'Monge':
          user.abilities.push(abilitiesFile.monge.normalAbilities[3]);
          user.abilityPower += 2;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.monge.normalAbilities[3].name }));
          break;
        case 'Necromante':
          user.abilities.push(abilitiesFile.necromante.normalAbilities[3]);
          user.maxMana += 40;
          user.abilityPower += 1;
          await user.save();
          message.menheraReply('level', t('roleplay:new-ability', { level: user.level, ability: abilitiesFile.necromante.normalAbilities[3].name }));
          break;
        default:
          break;
      }
    } else if (user.level === 16) {
      user.xp = 0;
      user.nextLevelXp = 100000;
      await user.save();
    } else if (user.level === 20) {
      user.xp = 0;
      user.nextLevelXp = 1000000;
      await user.save();
      message.menheraReply('warn', t('roleplay:boss'));
    } else if (user.level === 25) {
      user.xp = 0;
      user.nextLevelXp = 3000000;
      await user.save();
    } else if (user.level === 30) {
      user.xp = 0;
      user.nextLevelXp = 5000000;
      user.abilityPower += 1;
      this.evolve(user, message, t);
    }
  }, 500);
};

module.exports.resultBattle = async (message, user, inimigo, t, toSay) => {
  const randomLoot = inimigo.loots[Math.floor(Math.random() * inimigo.loots.length)];
  let canGetLoot = true;

  http.postRpg(user.id, user.class, user.level, inimigo.dgLevel, false, Date.now());

  const backpack = RPGUtil.getBackpack(user);
  if (backpack.value >= backpack.capacity) canGetLoot = false;

  const embed = new MessageEmbed()
    .setTitle(`⚔️ | ${t('roleplay:result.title')}`)
    .setDescription(t('roleplay:result.description', { enemy: inimigo.name }))
    .setColor('#4cf74b')
    .addFields([{
      name: '🔰 | XP',
      value: inimigo.xp,
      inline: true,
    },
    {
      name: `<:Chest:760957557538947133> | ${t('roleplay:result.loots')}`,
      value: (canGetLoot) ? randomLoot.name : t('roleplay:backpack-full'),
      inline: true,
    },
    ]);

  message.channel.send(toSay, embed);
  user.xp += inimigo.xp;
  if (canGetLoot) {
    user.loots.push(randomLoot);
  }
  user.inBattle = false;
  await user.save();
  return this.finalChecks(message, user, t);
};

module.exports.getAbilities = async (user) => {
  const abilities = [];

  let filtrado;

  switch (user.class) {
    case 'Assassino':
      filtrado = abilitiesFile.assassin;
      break;
    case 'Bárbaro':
      filtrado = abilitiesFile.barbarian;
      break;
    case 'Clérigo':
      filtrado = abilitiesFile.clerigo;
      break;
    case 'Druida':
      filtrado = abilitiesFile.druida;
      break;
    case 'Espadachim':
      filtrado = abilitiesFile.espadachim;
      break;
    case 'Feiticeiro':
      filtrado = abilitiesFile.feiticeiro;
      break;
    case 'Monge':
      filtrado = abilitiesFile.monge;
      break;
    case 'Necromante':
      filtrado = abilitiesFile.necromante;
      break;
    case 'Senhor das Sombras':
      filtrado = abilitiesFile.assassin;
      break;
    case 'Berserker':
      filtrado = abilitiesFile.barbarian;
      break;
    case 'Arcanjo':
      filtrado = abilitiesFile.clerigo;
      break;
    case 'Guardião da Natureza':
      filtrado = abilitiesFile.druida;
      break;
    case 'Mestre das Armas':
      filtrado = abilitiesFile.espadachim;
      break;
    case 'Senhor das Galáxias':
      filtrado = abilitiesFile.feiticeiro;
      break;
    case 'Mestre dos Elementos':
      filtrado = abilitiesFile.feiticeiro;
      break;
    case 'Conjurador Demoníaco':
      filtrado = abilitiesFile.feiticeiro;
      break;
    case 'Sacerdote':
      filtrado = abilitiesFile.monge;
      break;
    case 'Senhor das Trevas':
      filtrado = abilitiesFile.necromante;
      break;
  }

  const uniquePowerFiltred = filtrado.uniquePowers.filter((f) => f.name === user.uniquePower.name);
  const abilitiesFiltred = [];

  user.abilities.forEach((hab) => {
    const a = filtrado.normalAbilities.filter((f) => f.name === hab.name);
    abilitiesFiltred.push(a[0]);
  });

  abilities.push(uniquePowerFiltred[0]);

  abilitiesFiltred.forEach((hab) => {
    abilities.push(hab);
  });

  return abilities;
};

module.exports.initialChecks = async (user, message, t) => {
  let pass = true;
  const motivo = [];

  if (user.life < 1) {
    if (Date.now() > parseInt(user.death)) {
      user.life = user.maxLife;
      user.mana = user.maxMana;
    }
  }
  if (user.life < 1) {
    pass = false;
    motivo.push({
      name: `💔 | ${t('roleplay:initial.no-life')}`,
      value: t('roleplay:initial.no-life-text', { time: (parseInt(user.death - Date.now()) > 3600000) ? moment.utc(parseInt(user.death - Date.now())).format('HH:mm:ss') : moment.utc(parseInt(user.death - Date.now())).format('mm:ss') }),
    });
  }
  if (user.dungeonCooldown > Date.now()) {
    pass = false;
    motivo.push({
      name: `💤 | ${t('roleplay:initial.tired')}`,
      value: t('roleplay:initial.tired-text', { time: (parseInt(user.dungeonCooldown - Date.now()) > 3600000) ? moment.utc(parseInt(user.dungeonCooldown - Date.now())).format('HH:mm:ss') : moment.utc(parseInt(user.dungeonCooldown - Date.now())).format('mm:ss') }),
    });
  }

  if (parseInt(user.hotelTime) > Date.now()) {
    pass = false;
    motivo.push({
      name: '🏨 | Hotel',
      value: t('roleplay:initial.hotel-text', { time: (parseInt(user.hotelTime - Date.now()) > 3600000) ? moment.utc(parseInt(user.hotelTime - Date.now())).format('HH:mm:ss') : moment.utc(parseInt(user.hotelTime - Date.now())).format('mm:ss') }),
    });
  }

  if (user.inBattle) {
    pass = false;
    motivo.push({
      name: `⚔️ | ${t('roleplay:initial.in-battle')}`,
      value: t('roleplay:initial.in-battle-text'),
    });
  }

  if (!pass) {
    let texto = `<:negacao:759603958317711371> | ${t('roleplay:initial.cant-go')}`;
    motivo.forEach((m) => {
      texto += `\n**${m.name}:** ${m.value}`;
    });
    message.channel.send(texto);
  }
  return user.save().then(() => pass);
};

module.exports.confirmRegister = async (user, message, t) => {
  setTimeout(async () => {
    switch (user.class) {
      case 'Assassino': {
        const unicPowersAssassin = abilitiesFile.assassin.uniquePowers;
        const powerRandom = Math.floor(Math.random() * unicPowersAssassin.length);
        const choiceAssassin = unicPowersAssassin[powerRandom];
        user.armor = 5;
        user.damage = 25;
        user.mana = 20;
        user.maxMana = 20;
        user.abilityPower = 1;
        user.abilities.push(abilitiesFile.assassin.normalAbilities[0]);
        user.weapon = {
          name: 'Adaga',
          damage: 5,
          type: 'Arma',
        };
        user.uniquePower = choiceAssassin;
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }

      case 'Bárbaro': {
        const unicPowersBarbaro = abilitiesFile.barbarian.uniquePowers;
        const choiceBarbaro = unicPowersBarbaro[Math.floor(Math.random() * unicPowersBarbaro.length)];
        user.armor = 20;
        user.damage = 15;
        user.mana = 20;
        user.maxMana = 20;
        user.abilityPower = 1;
        user.abilities.push(abilitiesFile.barbarian.normalAbilities[0]);
        user.weapon = {
          name: 'Machado de dois Gumes',
          damage: 10,
          type: 'Arma',
        };
        user.uniquePower = choiceBarbaro;
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }

      case 'Druida': {
        const unicPowersDruida = abilitiesFile.druida.uniquePowers;
        const choiceDruida = unicPowersDruida[Math.floor(Math.random() * unicPowersDruida.length)];
        user.armor = 10;
        user.damage = 7;
        user.mana = 50;
        user.maxMana = 50;
        user.abilityPower = 3;
        user.abilities.push(abilitiesFile.druida.normalAbilities[0]);
        user.weapon = {
          name: 'Anel da Transformação',
          damage: 0,
          type: 'Arma',
        };
        user.uniquePower = choiceDruida;
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }

      case 'Espadachim': {
        const unicPowersEspadachim = abilitiesFile.espadachim.uniquePowers;
        const choiceEspadachim = unicPowersEspadachim[Math.floor(Math.random() * unicPowersEspadachim.length)];
        user.armor = 17;
        user.damage = 18;
        user.mana = 20;
        user.maxMana = 20;
        user.abilityPower = 1;
        user.abilities.push(abilitiesFile.espadachim.normalAbilities[0]);
        user.weapon = {
          name: 'Sabre',
          damage: 7,
          type: 'Arma',
        };
        user.uniquePower = choiceEspadachim;
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }

      case 'Feiticeiro': {
        const unicPowersFeiticeiro = abilitiesFile.feiticeiro.uniquePowers;
        const choiceFeiticeiro = unicPowersFeiticeiro[Math.floor(Math.random() * unicPowersFeiticeiro.length)];
        user.armor = 7;
        user.damage = 5;
        user.mana = 60;
        user.maxMana = 60;
        user.abilityPower = 4;
        user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[0]);
        user.weapon = {
          name: 'Cajado',
          damage: 5,
          type: 'Arma',
        };
        user.uniquePower = choiceFeiticeiro;
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }

      case 'Clérigo': {
        const unicPowersClerigo = abilitiesFile.clerigo.uniquePowers;
        const choiceClerigo = unicPowersClerigo[Math.floor(Math.random() * unicPowersClerigo.length)];
        user.armor = 10;
        user.damage = 4;
        user.mana = 60;
        user.maxMana = 60;
        user.abilityPower = 4;
        user.abilities.push(abilitiesFile.clerigo.normalAbilities[0]);
        user.weapon = {
          name: 'Tomo Sagrado',
          damage: 5,
          type: 'Arma',
        };
        user.uniquePower = choiceClerigo;
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }

      case 'Monge': {
        const unicPowersMonge = abilitiesFile.monge.uniquePowers;
        const choiceMonge = unicPowersMonge[Math.floor(Math.random() * unicPowersMonge.length)];
        user.armor = 18;
        user.damage = 14;
        user.mana = 20;
        user.maxMana = 20;
        user.abilityPower = 2;
        user.abilities.push(abilitiesFile.monge.normalAbilities[0]);
        user.uniquePower = choiceMonge;
        user.weapon = {
          name: 'Punhos',
          damage: 1,
          type: 'Arma',
        };
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }

      case 'Necromante': {
        const unicPowerNecromante = abilitiesFile.necromante.uniquePowers;
        const choiceNecromante = unicPowerNecromante[Math.floor(Math.random() * unicPowerNecromante.length)];
        user.armor = 7;
        user.damage = 5;
        user.mana = 60;
        user.maxMana = 60;
        user.abilityPower = 4;
        user.abilities.push(abilitiesFile.necromante.normalAbilities[0]);
        user.weapon = {
          name: 'Foice',
          damage: 5,
          type: 'Arma',
        };
        user.uniquePower = choiceNecromante;
        await user.save();
        message.menheraReply('success', t('roleplay:registred'));
        break;
      }
    }
  }, 1000);
};

module.exports.evolve = async (user, message, t) => {
  switch (user.class) {
    case 'Assassino': {
      user.abilities.push(abilitiesFile.assassin.normalAbilities[4]);
      user.damage += 10;
      user.class = 'Senhor das Sombras';
      await user.save();
      const translatedEvolve = t(`roleplay:classes.${user.class}`);
      message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      break;
    }
    case 'Bárbaro': {
      user.abilities.push(abilitiesFile.barbarian.normalAbilities[4]);
      user.maxLife += 50;
      user.class = 'Berserker';
      await user.save();
      const translatedEvolve = t(`roleplay:classes.${user.class}`);
      message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      break;
    }
    case 'Clérigo': {
      user.abilities.push(abilitiesFile.clerigo.normalAbilities[4]);
      user.maxMana += 40;
      user.class = 'Arcanjo';
      await user.save();
      const translatedEvolve = t(`roleplay:classes.${user.class}`);
      message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      break;
    }
    case 'Druida': {
      user.abilities.push(abilitiesFile.druida.normalAbilities[4]);
      user.maxMana += 30;
      user.class = 'Guardião da Natureza';
      await user.save();
      const translatedEvolve = t(`roleplay:classes.${user.class}`);
      message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      break;
    }
    case 'Espadachim': {
      user.abilities.push(abilitiesFile.espadachim.normalAbilities[4]);
      user.damage += 10;
      user.class = 'Mestre das Armas';
      await user.save();
      const translatedEvolve = t(`roleplay:classes.${user.class}`);
      message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      break;
    }
    case 'Feiticeiro': {
      if (user.uniquePower.name === 'Linhagem: Mística') {
        user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[10]);
        user.maxMana += 40;
        user.class = 'Senhor das Galáxias';
        await user.save();
        const translatedEvolve = t(`roleplay:classes.${user.class}`);
        message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      }
      if (user.uniquePower.name === 'Linhagem: Dracônica') {
        user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[11]);
        user.maxMana += 40;
        user.class = 'Mestre dos Elementos';
        await user.save();
        const translatedEvolve = t(`roleplay:classes.${user.class}`);
        message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      }
      if (user.uniquePower.name === 'Linhagem: Demoníaca') {
        user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[12]);
        user.maxMana += 40;
        user.class = 'Conjurador Demoníaco';
        await user.save();
        const translatedEvolve = t(`roleplay:classes.${user.class}`);
        message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      }
      break;
    }
    case 'Monge': {
      user.abilities.push(abilitiesFile.monge.normalAbilities[4]);
      user.class = 'Sacerdote';
      await user.save();
      const translatedEvolve = t(`roleplay:classes.${user.class}`);
      message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      break;
    }
    case 'Necromante': {
      user.abilities.push(abilitiesFile.necromante.normalAbilities[4]);
      user.maxMana += 40;
      user.class = 'Senhor das Trevas';
      await user.save();
      const translatedEvolve = t(`roleplay:classes.${user.class}`);
      message.menheraReply('warn', t('roleplay:evolve', { class: translatedEvolve }));
      break;
    }
  }
};
