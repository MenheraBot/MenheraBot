import moment from 'moment';
import { Message, MessageEmbed } from 'discord.js';
import {
  IAbility,
  IBattleChoice,
  IClassAbilities,
  IDungeonMob,
  IMobAttack,
  IUniquePower,
  IUserRpgSchema,
  TDungeonLevel,
} from '@utils/Types';
import CommandContext from '@structures/CommandContext';
import { Document } from 'mongoose';
import RPGUtil from '../../utils/RPGUtil';
import {
  abilities as abilitiesFile,
  familiars as familiarsFile,
  mobs as mobsFile,
} from '../RpgHandler';

import http from '../../utils/HTTPrequests';
import { rpg } from '../MenheraConstants';

const random = <T>(arr: Array<T>): T => arr[Math.floor(Math.random() * arr.length)];

const getEnemyByUserLevel = (
  user: IUserRpgSchema,
  type: string,
  dungeonLevel?: TDungeonLevel,
  ctx?: CommandContext,
): IDungeonMob | false | string => {
  if (type === 'boss') {
    if (user.level > 24 && user.level < 30) {
      return random<IDungeonMob>([...mobsFile.boss, ...mobsFile.gods]);
    }
    if (user.level >= 30) {
      return random<IDungeonMob>([...mobsFile.gods, ...mobsFile.universal]);
    }
    return random<IDungeonMob>(mobsFile.boss);
  }

  const validLevels = {
    1: {
      minUserLevel: 0,
      mob: random(mobsFile.inicial),
      level: 1,
    },
    2: {
      minUserLevel: 4,
      mob: random(mobsFile.medio),
      level: 2,
    },
    3: {
      minUserLevel: 9,
      mob: random(mobsFile.hard),
      level: 3,
    },
    4: {
      minUserLevel: 13,
      mob: random(mobsFile.impossible),
      level: 4,
    },
    5: {
      minUserLevel: 30,
      mob: random(mobsFile.evolved),
      level: 5,
    },
  };

  if (!dungeonLevel) return false;

  if (!validLevels[dungeonLevel]) return false;

  if (user.level < validLevels[dungeonLevel].minUserLevel) {
    const MaxMinLevel = Object.values(validLevels).reduce(
      (maxLevel, obj) =>
        user.level >= obj.minUserLevel && obj.level > maxLevel ? obj.level : maxLevel,
      0,
    );

    if (ctx)
      ctx.replyT('error', 'commands:dungeon.min-level-warn', {
        level: MaxMinLevel,
        toGo: validLevels[dungeonLevel].minUserLevel,
        wantLevel: dungeonLevel,
      });
    return 'LOW-LEVEL';
  }

  return validLevels[dungeonLevel].mob;
};

const battle = async (
  ctx: CommandContext,
  escolha: IBattleChoice,
  user: IUserRpgSchema & Document,
  inimigo: IDungeonMob,
  type: 'boss' | 'dungeon',
): Promise<void> => {
  let danoUser: number;
  if (escolha.scape) {
    await ctx.replyT('scape', 'roleplay:scape');
    await ctx.client.repositories.rpgRepository.update(ctx.message.author.id, {
      inBattle: false,
      dungeonCooldown: `${rpg.scapeCooldown + Date.now()}`,
    });
    return;
  }
  if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') {
    danoUser = escolha.damage as number;
  } else if (escolha.name === 'Morte Instantânea') {
    if (user.mana < user.maxMana)
      return enemyShot(
        ctx,
        user,
        inimigo,
        type,
        `⚔️ | ${ctx.locale('roleplay:battle.no-mana', { name: escolha.name })}`,
      );
    danoUser = inimigo.life / 2;
    user.mana = 0;
  } else {
    if (user.mana < escolha?.cost)
      return enemyShot(
        ctx,
        user,
        inimigo,
        type,
        `⚔️ | ${ctx.locale('roleplay:battle.no-mana', { name: escolha.name })}`,
      );
    if (escolha.heal && escolha.heal > 0) {
      user.life += escolha.heal;
      if (user.life > user.maxLife) user.life = user.maxLife;
    }
    danoUser =
      user?.familiar?.id && user.familiar.type === 'abilityPower'
        ? (escolha.damage as number) *
          (user.abilityPower +
            familiarsFile[user.familiar.id].boost.value +
            (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
        : user.abilityPower * (escolha.damage as number);
    user.mana -= escolha?.cost;
  }

  const enemyArmor = inimigo.armor;
  let danoDado = danoUser - enemyArmor;
  if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') danoDado = danoUser;
  if (danoDado < 0) danoDado = 0;
  const vidaInimigo = inimigo.life - danoDado;

  const toSay = `⚔️ | ${ctx.locale('roleplay:battle.attack', {
    enemy: inimigo.name,
    choice: escolha.name,
    damage: danoDado,
  })}`;

  if (vidaInimigo < 1) {
    return resultBattle(ctx, user, inimigo, toSay);
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

  return enemyShot(ctx, user, enemy, type, toSay);
};

const morte = async (
  ctx: CommandContext,
  user: IUserRpgSchema & Document,
  toSay: string,
  inimigo: IDungeonMob,
): Promise<void> => {
  await http.postRpg(user.id, user.class, user.level, inimigo.dgLevel ?? 0, true, Date.now());

  await ctx.reply('error', `${toSay}\n\n${ctx.locale('roleplay:death')}`);
  user.death = `{Date.now() + rpg.deathCooldown}`;
  user.life = 0;
  user.inBattle = false;
  await ctx.client.repositories.rpgRepository.update(ctx.message.author.id, {
    death: `${Date.now() + rpg.deathCooldown}`,
    life: 0,
    inBattle: false,
  });
};

const enemyShot = (
  ctx: CommandContext,
  user: IUserRpgSchema & Document,
  inimigo: IDungeonMob,
  type: 'boss' | 'dungeon',
  toSay: string,
): Promise<void> => {
  const habilidades = getAbilities(user);

  let danoRecebido: number;
  const armadura =
    user?.familiar?.id && user.familiar.type === 'armor'
      ? user.armor +
        user.protection.armor +
        (familiarsFile[user.familiar.id].boost.value +
          (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
      : user.armor + user.protection.armor;

  const ataque = inimigo.ataques[Math.floor(Math.random() * inimigo.ataques.length)];

  if (ataque.damage - armadura < 5) {
    danoRecebido = 5;
  } else {
    danoRecebido = ataque.damage - armadura;
  }
  const vidaUser = user.life - danoRecebido;

  if (vidaUser < 1) {
    return morte(ctx, user, toSay, inimigo);
  }
  user.life = vidaUser;
  return continueBattle(ctx, inimigo, habilidades, user, type, ataque, toSay);
};

const continueBattle = async (
  ctx: CommandContext,
  inimigo: IDungeonMob,
  habilidades: Array<IUniquePower & IAbility>,
  user: IUserRpgSchema & Document,
  type: 'boss' | 'dungeon',
  ataque: IMobAttack,
  toSay: string,
): Promise<void> => {
  const options: Array<IBattleChoice> = [
    {
      name: ctx.locale('commands:dungeon.scape'),
      damage: '🐥',
      scape: true,
      cost: 0,
    },
  ];

  options.push({
    name: ctx.locale('roleplay:basic-attack'),
    cost: 0,
    damage:
      user?.familiar?.id && user.familiar.type === 'damage'
        ? user.damage +
          user.weapon.damage +
          (familiarsFile[user.familiar.id].boost.value +
            (user.familiar.level - 1) * familiarsFile[user.familiar.id].boost.value)
        : user.damage + user.weapon.damage,
  });

  if (type === 'boss') {
    if (user.uniquePower.name === 'Morte Instantânea') {
      habilidades.splice(
        habilidades.findIndex((i) => i.name === 'Morte Instantânea'),
        1,
      );
    }
  }
  habilidades.forEach((hab) => {
    options.push(hab);
  });

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

  let damageReceived = ataque.damage - ptcView;
  if (damageReceived < 5) damageReceived = 5;

  let texto = ctx.locale('roleplay:battle.text', {
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

  for (let i = 0; i < options.length; i += 1) {
    texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${
      options[i].damage
    }**🗡️`;
  }

  const embed = new MessageEmbed()
    .setFooter(ctx.locale('roleplay:battle.footer'))
    .setColor('#f04682')
    .setDescription(texto);
  await ctx.sendC(toSay, embed);

  const filter = (m: Message) => m.author.id === ctx.message.author.id;
  const collector = ctx.message.channel.createMessageCollector(filter, {
    max: 1,
    time: 7000,
  });

  let time = false;

  collector.on('collect', (m) => {
    time = true;
    const choice = Number(m.content);
    if (choice >= 0 && choice < options.length) {
      return battle(ctx, options[choice], user, inimigo, type); // Mandar os dados de ataque, e defesa do inimigo, para fazer o calculo lá
    }
    return enemyShot(ctx, user, inimigo, type, `⚔️ |  ${ctx.locale('roleplay:battle.new-tatic')}`);
  });

  setTimeout(() => {
    if (!time) {
      collector.stop();
      return enemyShot(ctx, user, inimigo, type, `⚔️ | ${ctx.locale('roleplay:battle.timeout')}`);
    }
  }, 7000);
};

const finalChecks = async (ctx: CommandContext, user: IUserRpgSchema & Document): Promise<void> => {
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
        await ctx.send(texto);
        await newAbilities(ctx, user);
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
        await ctx.send(texto);
        await user.save();
        await newAbilities(ctx, user);
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
        await ctx.send(texto);
        await user.save();
        await newAbilities(ctx, user);
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
        await ctx.send(texto);
        await user.save();
        await newAbilities(ctx, user);
      }
    }
  }, 500);
};

const newAbilities = async (
  ctx: CommandContext,
  user: IUserRpgSchema & Document,
): Promise<void> => {
  setTimeout(async () => {
    if (user.level === 5) {
      switch (user.class) {
        case 'Assassino':
          user.abilities.push(abilitiesFile.assassin.normalAbilities[1]);
          user.maxMana += 20;
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.assassin.normalAbilities[1].name,
          });
          break;
        case 'Bárbaro':
          user.abilities.push(abilitiesFile.barbarian.normalAbilities[1]);
          user.maxLife += 20;
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.barbarian.normalAbilities[1].name,
          });
          break;
        case 'Clérigo':
          user.abilities.push(abilitiesFile.clerigo.normalAbilities[1]);
          user.abilityPower += 1;
          user.maxMana += 20;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.clerigo.normalAbilities[1].name,
          });
          break;
        case 'Druida':
          user.abilities.push(abilitiesFile.druida.normalAbilities[1]);
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.druida.normalAbilities[1].name,
          });
          break;
        case 'Espadachim':
          user.abilities.push(abilitiesFile.espadachim.normalAbilities[1]);
          user.abilityPower += 2;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.espadachim.normalAbilities[1].name,
          });
          break;
        case 'Feiticeiro':
          if (user.uniquePower.name === 'Linhagem: Mística') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[1]);
            user.maxMana += 20;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[1].name,
            });
          }
          if (user.uniquePower.name === 'Linhagem: Dracônica') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[2]);
            user.maxMana += 20;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[2].name,
            });
          }
          if (user.uniquePower.name === 'Linhagem: Demoníaca') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[3]);
            user.maxMana += 20;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[3].name,
            });
          }
          break;
        case 'Monge':
          user.abilities.push(abilitiesFile.monge.normalAbilities[1]);
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.monge.normalAbilities[1].name,
          });
          break;
        case 'Necromante':
          user.abilities.push(abilitiesFile.necromante.normalAbilities[1]);
          user.maxMana += 20;
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.necromante.normalAbilities[1].name,
          });
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
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.assassin.normalAbilities[2].name,
          });
          break;
        case 'Bárbaro':
          user.abilities.push(abilitiesFile.barbarian.normalAbilities[2]);
          user.maxLife += 50;
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.barbarian.normalAbilities[2].name,
          });
          break;
        case 'Clérigo':
          user.abilities.push(abilitiesFile.clerigo.normalAbilities[2]);
          user.abilityPower += 1;
          user.maxMana += 20;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.clerigo.normalAbilities[2].name,
          });
          break;
        case 'Druida':
          user.abilities.push(abilitiesFile.druida.normalAbilities[2]);
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.druida.normalAbilities[2].name,
          });
          break;
        case 'Espadachim':
          user.abilities.push(abilitiesFile.espadachim.normalAbilities[2]);
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.espadachim.normalAbilities[2].name,
          });
          break;
        case 'Feiticeiro':
          if (user.uniquePower.name === 'Linhagem: Mística') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[4]);
            user.maxMana += 25;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[4].name,
            });
          }
          if (user.uniquePower.name === 'Linhagem: Dracônica') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[5]);
            user.maxMana += 25;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[5].name,
            });
          }
          if (user.uniquePower.name === 'Linhagem: Demoníaca') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[6]);
            user.maxMana += 25;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[6].name,
            });
          }
          break;
        case 'Monge':
          user.abilities.push(abilitiesFile.monge.normalAbilities[2]);
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.monge.normalAbilities[2].name,
          });
          break;
        case 'Necromante':
          user.abilities.push(abilitiesFile.necromante.normalAbilities[2]);
          user.maxMana += 25;
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.necromante.normalAbilities[2].name,
          });
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
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.assassin.normalAbilities[3].name,
          });
          break;
        case 'Bárbaro':
          user.abilities.push(abilitiesFile.barbarian.normalAbilities[3]);
          user.maxLife += 50;
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.barbarian.normalAbilities[3].name,
          });
          break;
        case 'Clérigo':
          user.abilities.push(abilitiesFile.clerigo.normalAbilities[3]);
          user.abilityPower += 1;
          user.maxMana += 40;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.clerigo.normalAbilities[3].name,
          });
          break;
        case 'Druida':
          user.abilities.push(abilitiesFile.druida.normalAbilities[3]);
          user.abilityPower += 1;
          user.maxMana += 30;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.druida.normalAbilities[3].name,
          });
          break;
        case 'Espadachim':
          user.abilities.push(abilitiesFile.espadachim.normalAbilities[3]);
          user.abilityPower += 1;
          user.damage += 10;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.espadachim.normalAbilities[3].name,
          });
          break;
        case 'Feiticeiro':
          if (user.uniquePower.name === 'Linhagem: Mística') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[7]);
            user.maxMana += 40;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[7].name,
            });
          }
          if (user.uniquePower.name === 'Linhagem: Dracônica') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[8]);
            user.maxMana += 40;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[8].name,
            });
          }
          if (user.uniquePower.name === 'Linhagem: Demoníaca') {
            user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[9]);
            user.maxMana += 40;
            user.abilityPower += 1;
            await user.save();
            await ctx.replyT('level', 'roleplay:new-ability', {
              level: user.level,
              ability: abilitiesFile.feiticeiro.normalAbilities[9].name,
            });
          }
          break;
        case 'Monge':
          user.abilities.push(abilitiesFile.monge.normalAbilities[3]);
          user.abilityPower += 2;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.monge.normalAbilities[3].name,
          });
          break;
        case 'Necromante':
          user.abilities.push(abilitiesFile.necromante.normalAbilities[3]);
          user.maxMana += 40;
          user.abilityPower += 1;
          await user.save();
          await ctx.replyT('level', 'roleplay:new-ability', {
            level: user.level,
            ability: abilitiesFile.necromante.normalAbilities[3].name,
          });
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
      await ctx.replyT('warn', 'roleplay:boss');
    } else if (user.level === 25) {
      user.xp = 0;
      user.nextLevelXp = 3000000;
      await user.save();
    } else if (user.level === 30) {
      user.xp = 0;
      user.nextLevelXp = 5000000;
      user.abilityPower += 1;
      await evolve(user, ctx);
    }
  }, 500);
};

const resultBattle = async (
  ctx: CommandContext,
  user: IUserRpgSchema & Document,
  inimigo: IDungeonMob,
  toSay: string,
): Promise<void> => {
  const randomLoot = inimigo.loots[Math.floor(Math.random() * inimigo.loots.length)];
  let canGetLoot = true;

  await http.postRpg(user.id, user.class, user.level, inimigo.dgLevel ?? 0, false, Date.now());

  const backpack = RPGUtil.getBackpack(user);
  if (backpack.value >= backpack.capacity) canGetLoot = false;

  const embed = new MessageEmbed()
    .setTitle(`⚔️ | ${ctx.locale('roleplay:result.title')}`)
    .setDescription(ctx.locale('roleplay:result.description', { enemy: inimigo.name }))
    .setColor('#4cf74b')
    .addFields([
      {
        name: '🔰 | XP',
        value: inimigo.xp,
        inline: true,
      },
      {
        name: `<:Chest:760957557538947133> | ${ctx.locale('roleplay:result.loots')}`,
        value: canGetLoot ? randomLoot.name : ctx.locale('roleplay:backpack-full'),
        inline: true,
      },
    ]);

  user.xp += inimigo.xp;
  if (canGetLoot) {
    user.loots.push(randomLoot);
  }
  user.inBattle = false;
  await user.save();
  await ctx.sendC(toSay, embed);
  return finalChecks(ctx, user);
};

const getAbilities = (user: IUserRpgSchema): Array<IAbility & IUniquePower> => {
  const abilities = [];

  let filtrado: IClassAbilities;

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
    default:
      filtrado = abilitiesFile.assassin;
      break;
  }

  const uniquePowerFiltred = filtrado.uniquePowers.filter(
    (f: IUniquePower) => f.name === user.uniquePower.name,
  );
  const abilitiesFiltred: Array<IAbility | IUniquePower> = [];

  user.abilities.forEach((hab) => {
    const a = filtrado.normalAbilities.filter((f: IAbility) => f.name === hab.name);
    abilitiesFiltred.push(a[0]);
  });

  abilities.push(uniquePowerFiltred[0]);

  abilitiesFiltred.forEach((hab) => {
    abilities.push(hab);
  });

  return abilities;
};

const initialChecks = async (
  user: IUserRpgSchema & Document,
  ctx: CommandContext,
): Promise<boolean> => {
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
      name: `💔 | ${ctx.locale('roleplay:initial.no-life')}`,
      value: ctx.locale('roleplay:initial.no-life-text', {
        time:
          parseInt(user.death) - Date.now() > 3600000
            ? moment.utc(parseInt(user.death) - Date.now()).format('HH:mm:ss')
            : moment.utc(parseInt(user.death) - Date.now()).format('mm:ss'),
      }),
    });
  }
  if (parseInt(user.dungeonCooldown) > Date.now()) {
    pass = false;
    motivo.push({
      name: `💤 | ${ctx.locale('roleplay:initial.tired')}`,
      value: ctx.locale('roleplay:initial.tired-text', {
        time:
          parseInt(user.dungeonCooldown) - Date.now() > 3600000
            ? moment.utc(parseInt(user.dungeonCooldown) - Date.now()).format('HH:mm:ss')
            : moment.utc(parseInt(user.dungeonCooldown) - Date.now()).format('mm:ss'),
      }),
    });
  }

  if (parseInt(user.hotelTime) > Date.now()) {
    pass = false;
    motivo.push({
      name: '🏨 | Hotel',
      value: ctx.locale('roleplay:initial.hotel-text', {
        time:
          parseInt(user.hotelTime) - Date.now() > 3600000
            ? moment.utc(parseInt(user.hotelTime) - Date.now()).format('HH:mm:ss')
            : moment.utc(parseInt(user.hotelTime) - Date.now()).format('mm:ss'),
      }),
    });
  }

  if (user.inBattle) {
    pass = false;
    motivo.push({
      name: `⚔️ | ${ctx.locale('roleplay:initial.in-battle')}`,
      value: ctx.locale('roleplay:initial.in-battle-text'),
    });
  }

  if (!pass) {
    let texto = `<:negacao:759603958317711371> | ${ctx.locale('roleplay:initial.cant-go')}`;
    motivo.forEach((m) => {
      texto += `\n**${m.name}:** ${m.value}`;
    });
    await ctx.send(texto);
  }
  await user.save();
  return pass;
};

const confirmRegister = async (
  user: IUserRpgSchema & Document,
  ctx: CommandContext,
): Promise<void> => {
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
        await ctx.replyT('success', 'roleplay:registred');
        break;
      }

      case 'Bárbaro': {
        const unicPowersBarbaro = abilitiesFile.barbarian.uniquePowers;
        const choiceBarbaro =
          unicPowersBarbaro[Math.floor(Math.random() * unicPowersBarbaro.length)];
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
        await ctx.replyT('success', 'roleplay:registred');
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
        await ctx.replyT('success', 'roleplay:registred');
        break;
      }

      case 'Espadachim': {
        const unicPowersEspadachim = abilitiesFile.espadachim.uniquePowers;
        const choiceEspadachim =
          unicPowersEspadachim[Math.floor(Math.random() * unicPowersEspadachim.length)];
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
        await ctx.replyT('success', 'roleplay:registred');
        break;
      }

      case 'Feiticeiro': {
        const unicPowersFeiticeiro = abilitiesFile.feiticeiro.uniquePowers;
        const choiceFeiticeiro =
          unicPowersFeiticeiro[Math.floor(Math.random() * unicPowersFeiticeiro.length)];
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
        await ctx.replyT('success', 'roleplay:registred');
        break;
      }

      case 'Clérigo': {
        const unicPowersClerigo = abilitiesFile.clerigo.uniquePowers;
        const choiceClerigo =
          unicPowersClerigo[Math.floor(Math.random() * unicPowersClerigo.length)];
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
        await ctx.replyT('success', 'roleplay:registred');
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
        await ctx.replyT('success', 'roleplay:registred');
        break;
      }

      case 'Necromante': {
        const unicPowerNecromante = abilitiesFile.necromante.uniquePowers;
        const choiceNecromante =
          unicPowerNecromante[Math.floor(Math.random() * unicPowerNecromante.length)];
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
        await ctx.replyT('success', 'roleplay:registred');
        break;
      }
    }
  }, 1000);
};

const evolve = async (user: IUserRpgSchema & Document, ctx: CommandContext): Promise<void> => {
  switch (user.class) {
    case 'Assassino': {
      user.abilities.push(abilitiesFile.assassin.normalAbilities[4]);
      user.damage += 10;
      user.class = 'Senhor das Sombras';
      await user.save();
      const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
      await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      break;
    }
    case 'Bárbaro': {
      user.abilities.push(abilitiesFile.barbarian.normalAbilities[4]);
      user.maxLife += 50;
      user.class = 'Berserker';
      await user.save();
      const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
      await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      break;
    }
    case 'Clérigo': {
      user.abilities.push(abilitiesFile.clerigo.normalAbilities[4]);
      user.maxMana += 40;
      user.class = 'Arcanjo';
      await user.save();
      const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
      await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      break;
    }
    case 'Druida': {
      user.abilities.push(abilitiesFile.druida.normalAbilities[4]);
      user.maxMana += 30;
      user.class = 'Guardião da Natureza';
      await user.save();
      const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
      await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      break;
    }
    case 'Espadachim': {
      user.abilities.push(abilitiesFile.espadachim.normalAbilities[4]);
      user.damage += 10;
      user.class = 'Mestre das Armas';
      await user.save();
      const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
      await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      break;
    }
    case 'Feiticeiro': {
      if (user.uniquePower.name === 'Linhagem: Mística') {
        user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[10]);
        user.maxMana += 40;
        user.class = 'Senhor das Galáxias';
        await user.save();
        const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
        await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      }
      if (user.uniquePower.name === 'Linhagem: Dracônica') {
        user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[11]);
        user.maxMana += 40;
        user.class = 'Mestre dos Elementos';
        await user.save();
        const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
        await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      }
      if (user.uniquePower.name === 'Linhagem: Demoníaca') {
        user.abilities.push(abilitiesFile.feiticeiro.normalAbilities[12]);
        user.maxMana += 40;
        user.class = 'Conjurador Demoníaco';
        await user.save();
        const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
        await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      }
      break;
    }
    case 'Monge': {
      user.abilities.push(abilitiesFile.monge.normalAbilities[4]);
      user.class = 'Sacerdote';
      await user.save();
      const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
      await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      break;
    }
    case 'Necromante': {
      user.abilities.push(abilitiesFile.necromante.normalAbilities[4]);
      user.maxMana += 40;
      user.class = 'Senhor das Trevas';
      await user.save();
      const translatedEvolve = ctx.locale(`roleplay:classes.${user.class}`);
      await ctx.replyT('warn', 'roleplay:evolve', { class: translatedEvolve });
      break;
    }
  }
};

export {
  getEnemyByUserLevel,
  battle,
  morte,
  enemyShot,
  continueBattle,
  finalChecks,
  newAbilities,
  resultBattle,
  getAbilities,
  initialChecks,
  confirmRegister,
  evolve,
};
