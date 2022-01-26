import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis, ROLEPLAY_CONSTANTS } from '@structures/Constants';
import Util, { actionRow } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import moment from 'moment';
import Handler from './Handler';
import {
  AttackChoice,
  BattleChoice,
  IncomingAttackChoice,
  Mob,
  NormalAbility,
  RoleplayUserSchema,
  UniquePower,
} from './Types';
import RPGUtil from './Utils';

const RandomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getEnemyByUserLevel = (
  user: RoleplayUserSchema,
  type: BattleChoice,
  dungeonLevel?: 1 | 2 | 3 | 4 | 5,
  ctx?: InteractionCommandContext,
): string | boolean | Mob => {
  if (type === 'boss') {
    if (user.level > 24 && user.level < 30) {
      return RandomFromArray([...Handler.mobs.boss, ...Handler.mobs.gods]);
    }
    if (user.level >= 30) {
      return RandomFromArray([...Handler.mobs.gods, ...Handler.mobs.universal]);
    }
    return RandomFromArray(Handler.mobs.boss);
  }

  const validLevels = {
    1: {
      minUserLevel: 0,
      mob: RandomFromArray(Handler.mobs.inicial),
      level: 1,
    },
    2: {
      minUserLevel: 4,
      mob: RandomFromArray(Handler.mobs.medio),
      level: 2,
    },
    3: {
      minUserLevel: 9,
      mob: RandomFromArray(Handler.mobs.hard),
      level: 3,
    },
    4: {
      minUserLevel: 13,
      mob: RandomFromArray(Handler.mobs.impossible),
      level: 4,
    },
    5: {
      minUserLevel: 30,
      mob: RandomFromArray(Handler.mobs.evolved),
      level: 5,
    },
  };

  if (!dungeonLevel) return false;

  if (!ctx) return false;

  if (!validLevels[dungeonLevel]) return false;

  if (user.level < validLevels[dungeonLevel].minUserLevel) {
    const MaxMinLevel = Object.values(validLevels).reduce(
      (maxLevel, obj) =>
        user.level >= obj.minUserLevel && obj.level > maxLevel ? obj.level : maxLevel,
      0,
    );

    ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:dungeon.min-level-warn', {
        level: MaxMinLevel,
        toGo: validLevels[dungeonLevel].minUserLevel,
        wantLevel: dungeonLevel,
      }),
    });
    return 'LOW-LEVEL';
  }

  return validLevels[dungeonLevel].mob;
};

const battle = async (
  ctx: InteractionCommandContext,
  escolha: IncomingAttackChoice,
  user: RoleplayUserSchema,
  inimigo: Mob,
  type: BattleChoice,
): Promise<void> => {
  let danoUser;

  if (escolha.name === ctx.locale('commands:dungeon.scape')) {
    ctx.makeMessage({ content: ctx.prettyResponse('scape', 'roleplay:scape') });
    ctx.client.repositories.roleplayRepository.updateUser(user.id, {
      life: user.life,
      mana: user.mana,
      adventureCooldown: ROLEPLAY_CONSTANTS.scapeCooldown + Date.now(),
    });
    return;
  }
  if (escolha.name === 'Ataque Básico' || escolha.name === 'Basic Attack') {
    danoUser = Number(escolha.damage);
  } else {
    if (user.mana < (escolha?.cost ?? 0))
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
    danoUser = user.abilityPower * Number(escolha.damage);
    user.mana -= Number(escolha?.cost) ?? 0;
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

  if (vidaInimigo < 1) return resultBattle(ctx, user, inimigo, toSay);

  const enemy = {
    name: inimigo.name,
    damage: inimigo.damage,
    life: vidaInimigo,
    armor: inimigo.armor,
    loots: inimigo.loots,
    xp: inimigo.xp,
    ataques: inimigo.ataques,
    type: inimigo.type,
  };

  enemyShot(ctx, user, enemy, type, toSay);
};

const morte = async (
  ctx: InteractionCommandContext,
  user: RoleplayUserSchema,
  toSay: string,
): Promise<void> => {
  ctx.makeMessage({ content: `${emojis.error} | ${toSay}\n\n${ctx.locale('roleplay:death')}` });

  await ctx.client.repositories.roleplayRepository.updateUser(user.id, {
    life: 0,
    inBattle: false,
    death: Date.now() + ROLEPLAY_CONSTANTS.deathCooldown,
  });
};

const enemyShot = async (
  ctx: InteractionCommandContext,
  user: RoleplayUserSchema,
  inimigo: Mob,
  type: BattleChoice,
  toSay: string,
): Promise<void> => {
  const habilidades = getAbilities(user);

  let danoRecebido;
  const armadura = user.armor + user.protection.armor;

  const ataque = RandomFromArray(inimigo.ataques);

  if (ataque.damage - armadura < 5) {
    danoRecebido = 5;
  } else {
    danoRecebido = ataque.damage - armadura;
  }
  const vidaUser = user.life - danoRecebido;

  if (vidaUser < 1) {
    return morte(ctx, user, toSay);
  }

  user.life = vidaUser;
  continueBattle(ctx, inimigo, habilidades, user, type, ataque, toSay);
};

const continueBattle = async (
  ctx: InteractionCommandContext,
  inimigo: Mob,
  habilidades: Array<NormalAbility | UniquePower>,
  user: RoleplayUserSchema,
  type: BattleChoice,
  ataque: AttackChoice,
  toSay: string,
): Promise<void> => {
  const options: Array<IncomingAttackChoice> = [
    {
      name: ctx.locale('commands:dungeon.scape'),
      damage: 0,
      scape: true,
    },
  ];

  options.push({
    name: ctx.locale('roleplay:basic-attack'),
    damage: user.damage + user.weapon.damage,
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

  const dmgView = user.damage + user.weapon.damage;
  const ptcView = user.armor + user.protection.armor;

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

  const action = new MessageSelectMenu()
    .setCustomId(`${ctx.interaction.id} | ATTACK`)
    .setMinValues(1)
    .setMaxValues(1);

  for (let i = 0; i < options.length; i += 1) {
    texto += `\n**${i}** - ${options[i].name} | **${options[i].cost || 0}**💧, **${
      options[i].damage
    }**🗡️`;
    action.addOptions({ label: options[i].name, value: `${i}` });
  }

  const embed = new MessageEmbed()
    .setFooter({ text: ctx.locale('roleplay:battle.footer') })
    .setColor('#f04682')
    .setDescription(texto);

  await ctx.makeMessage({ content: toSay, embeds: [embed], components: [actionRow([action])] });

  const selected = await Util.collectComponentInteractionWithStartingId<SelectMenuInteraction>(
    ctx.channel,
    ctx.author.id,
    ctx.interaction.id,
    7500,
  );

  if (!selected)
    return enemyShot(ctx, user, inimigo, type, `⚔️ | ${ctx.locale('roleplay:battle.timeout')}`);

  battle(ctx, options[Number(selected.values[0])], user, inimigo, type);
};

const finalChecks = async (
  ctx: InteractionCommandContext,
  user: RoleplayUserSchema,
): Promise<void> => {
  let texto = '';

  if (user.level < 5) {
    if (user.xp >= user.nextLevelXp) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        xp: 0,
        level: user.level + 1,
        nextLevelXp: user.nextLevelXp * 2,
        maxLife: user.maxLife + 10,
        maxMana: user.maxMana + 10,
        damage: user.damage + 3,
        armor: user.armor + 2,
      });
      ctx.makeMessage({ content: texto });
      newAbilities(ctx, user);
    }
  } else if (user.level > 4 && user.level < 10) {
    if (user.xp >= user.nextLevelXp) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        xp: 0,
        level: user.level + 1,
        nextLevelXp: user.nextLevelXp * 2,
        maxLife: user.maxLife + 20,
        maxMana: user.maxMana + 15,
        damage: user.damage + 5,
        armor: user.armor + 3,
      });
      ctx.makeMessage({ content: texto });
      newAbilities(ctx, user);
    }
  } else if (user.level > 9 && user.level < 29) {
    if (user.xp >= user.nextLevelXp) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        level: user.level + 1,
        nextLevelXp: user.nextLevelXp * 2,
        maxLife: user.maxLife + 50,
        maxMana: user.maxMana + 20,
        damage: user.damage + 7,
        armor: user.armor + 5,
      });
      ctx.makeMessage({ content: texto });
      newAbilities(ctx, user);
    }
  } else if (user.level >= 29) {
    if (user.xp >= user.nextLevelXp) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        xp: 0,
        level: user.level + 1,
        nextLevelXp: user.nextLevelXp * 2,
        maxLife: user.maxLife + 50,
        maxMana: user.maxMana + 50,
        damage: user.damage + 10,
        armor: user.armor + 2,
      });
      ctx.makeMessage({ content: texto });
      newAbilities(ctx, user);
    }
  }
};

const newAbilities = async (
  ctx: InteractionCommandContext,
  user: RoleplayUserSchema,
): Promise<void> => {
  if (user.level === 5) {
    switch (user.class) {
      case 'Assassino':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.assassin.normalAbilities[1],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          maxMana: user.maxMana + 20,
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.assassin.normalAbilities[1] },
        });
        break;
      case 'Bárbaro':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.barbarian.normalAbilities[1],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          maxMana: user.maxMana + 20,
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.barbarian.normalAbilities[1] },
        });
        break;
      case 'Clérigo':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.clerigo.normalAbilities[1],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          maxMana: user.maxMana + 20,
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.clerigo.normalAbilities[1] },
        });
        break;
      case 'Druida':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.druida.normalAbilities[1],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.druida.normalAbilities[1] },
        });
        break;
      case 'Espadachim':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.espadachim.normalAbilities[1],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 2,
          $push: { abilities: Handler.abilities.espadachim.normalAbilities[1] },
        });
        break;
      case 'Feiticeiro':
        if (user.uniquePower.name === 'Linhagem: Mística') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[1],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            maxMana: user.maxMana + 20,
            abilityPower: user.abilityPower + 1,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[1] },
          });
        }
        if (user.uniquePower.name === 'Linhagem: Dracônica') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[2],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            maxMana: user.maxMana + 20,
            abilityPower: user.abilityPower + 1,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[2] },
          });
        }
        if (user.uniquePower.name === 'Linhagem: Demoníaca') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[3],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            maxMana: user.maxMana + 20,
            abilityPower: user.abilityPower + 1,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[3] },
          });
        }
        break;
      case 'Monge':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.monge.normalAbilities[1],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.monge.normalAbilities[1] },
        });
        break;
      case 'Necromante':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.necromante.normalAbilities[1],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          maxMana: user.maxMana + 20,
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.necromante.normalAbilities[1] },
        });
        break;
    }
  } else if (user.level === 10) {
    switch (user.class) {
      case 'Assassino':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.assassin.normalAbilities[2],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.assassin.normalAbilities[1] },
        });
        break;
      case 'Bárbaro':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.barbarian.normalAbilities[2],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          maxLife: user.maxLife + 50,
          $push: { abilities: Handler.abilities.barbarian.normalAbilities[2] },
        });
        break;
      case 'Clérigo':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.clerigo.normalAbilities[2],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          maxMana: user.maxMana + 50,
          $push: { abilities: Handler.abilities.clerigo.normalAbilities[2] },
        });
        break;
      case 'Druida':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.druida.normalAbilities[2],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.druida.normalAbilities[2] },
        });
        break;
      case 'Espadachim':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.espadachim.normalAbilities[2],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.espadachim.normalAbilities[2] },
        });
        break;
      case 'Feiticeiro':
        if (user.uniquePower.name === 'Linhagem: Mística') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[4],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            abilityPower: user.abilityPower + 1,
            maxMana: user.maxLife + 25,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[4] },
          });
        }
        if (user.uniquePower.name === 'Linhagem: Dracônica') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[5],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            abilityPower: user.abilityPower + 1,
            maxMana: user.maxLife + 25,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[5] },
          });
        }
        if (user.uniquePower.name === 'Linhagem: Demoníaca') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[6],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            abilityPower: user.abilityPower + 1,
            maxMana: user.maxLife + 25,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[6] },
          });
        }
        break;
      case 'Monge':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.monge.normalAbilities[2],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          $push: { abilities: Handler.abilities.monge.normalAbilities[2] },
        });
        break;
      case 'Necromante':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.necromante.normalAbilities[2],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          maxMana: user.maxLife + 25,
          $push: { abilities: Handler.abilities.necromante.normalAbilities[2] },
        });
        break;
    }
  } else if (user.level === 14) {
    switch (user.class) {
      case 'Assassino':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.feiticeiro.normalAbilities[3],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          damage: user.damage + 10,
          $push: { abilities: Handler.abilities.assassin.normalAbilities[3] },
        });
        break;
      case 'Bárbaro':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.barbarian.normalAbilities[3],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          maxLife: user.maxLife + 50,
          $push: { abilities: Handler.abilities.barbarian.normalAbilities[3] },
        });
        break;
      case 'Clérigo':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.clerigo.normalAbilities[3],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          maxMana: user.maxMana + 40,
          $push: { abilities: Handler.abilities.clerigo.normalAbilities[3] },
        });
        break;
      case 'Druida':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.druida.normalAbilities[3],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          maxMana: user.maxMana + 30,
          $push: { abilities: Handler.abilities.druida.normalAbilities[3] },
        });
        break;
      case 'Espadachim':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.espadachim.normalAbilities[3],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          damage: user.damage + 10,
          $push: { abilities: Handler.abilities.espadachim.normalAbilities[3] },
        });
        break;
      case 'Feiticeiro':
        if (user.uniquePower.name === 'Linhagem: Mística') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[7],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            abilityPower: user.abilityPower + 1,
            maxMana: user.maxMana + 40,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[7] },
          });
        }
        if (user.uniquePower.name === 'Linhagem: Dracônica') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[8],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            abilityPower: user.abilityPower + 1,
            maxMana: user.maxMana + 40,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[8] },
          });
        }
        if (user.uniquePower.name === 'Linhagem: Demoníaca') {
          ctx.makeMessage({
            content: ctx.prettyResponse('level', 'roleplay:new-ability', {
              level: user.level,
              ability: Handler.abilities.feiticeiro.normalAbilities[9],
            }),
          });
          ctx.client.repositories.roleplayRepository.updateUser(user.id, {
            abilityPower: user.abilityPower + 1,
            maxMana: user.maxMana + 40,
            $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[9] },
          });
        }
        break;
      case 'Monge':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.monge.normalAbilities[3],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 2,
          $push: { abilities: Handler.abilities.monge.normalAbilities[3] },
        });
        break;
      case 'Necromante':
        ctx.makeMessage({
          content: ctx.prettyResponse('level', 'roleplay:new-ability', {
            level: user.level,
            ability: Handler.abilities.necromante.normalAbilities[3],
          }),
        });
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          abilityPower: user.abilityPower + 1,
          maxMana: user.maxMana + 40,
          $push: { abilities: Handler.abilities.necromante.normalAbilities[3] },
        });
        break;
    }
  } else if (user.level === 16) {
    ctx.client.repositories.roleplayRepository.updateUser(user.id, {
      xp: 0,
      nextLevelXp: 100000,
    });
  } else if (user.level === 20) {
    ctx.client.repositories.roleplayRepository.updateUser(user.id, {
      xp: 0,
      nextLevelXp: 1000000,
    });
    ctx.makeMessage({ content: ctx.prettyResponse('warn', 'roleplay:boss') });
  } else if (user.level === 25) {
    ctx.client.repositories.roleplayRepository.updateUser(user.id, {
      xp: 0,
      nextLevelXp: 3000000,
    });
  } else if (user.level === 30) {
    ctx.client.repositories.roleplayRepository.updateUser(user.id, {
      xp: 0,
      nextLevelXp: 5000000,
      abilityPower: user.abilityPower + 1,
    });

    evolve(user, ctx);
  }
};

const resultBattle = async (
  ctx: InteractionCommandContext,
  user: RoleplayUserSchema,
  inimigo: Mob,
  toSay: string,
): Promise<void> => {
  const randomLoot = RandomFromArray(inimigo.loots);
  let canGetLoot = true;

  const backpack = RPGUtil.getBackpack(user);
  if (backpack.value >= backpack.capacity) canGetLoot = false;

  const embed = new MessageEmbed()
    .setTitle(`⚔️ | ${ctx.locale('roleplay:result.title')}`)
    .setDescription(ctx.locale('roleplay:result.description', { enemy: inimigo.name }))
    .setColor('#4cf74b')
    .addFields([
      {
        name: '🔰 | XP',
        value: `${inimigo.xp}`,
        inline: true,
      },
      {
        name: `<:Chest:760957557538947133> | ${ctx.locale('roleplay:result.loots')}`,
        value: `${canGetLoot ? randomLoot.name : ctx.locale('roleplay:backpack-full')}`,
        inline: true,
      },
    ]);

  ctx.makeMessage({ content: toSay, embeds: [embed] });
  const toAddLoots = [];

  if (canGetLoot) {
    toAddLoots.push(randomLoot);
  }

  ctx.client.repositories.roleplayRepository.updateUser(user.id, {
    $inc: { xp: inimigo.xp },
    inBattle: false,
    $push: { loots: toAddLoots },
  });

  return finalChecks(ctx, user);
};

const getAbilities = (user: RoleplayUserSchema): Array<NormalAbility | UniquePower> => {
  const abilities = [];

  let filtrado: typeof Handler.abilities.assassin;

  switch (user.class) {
    case 'Assassino':
      filtrado = Handler.abilities.assassin;
      break;
    case 'Bárbaro':
      filtrado = Handler.abilities.barbarian;
      break;
    case 'Clérigo':
      filtrado = Handler.abilities.clerigo;
      break;
    case 'Druida':
      filtrado = Handler.abilities.druida;
      break;
    case 'Espadachim':
      filtrado = Handler.abilities.espadachim;
      break;
    case 'Feiticeiro':
      filtrado = Handler.abilities.feiticeiro;
      break;
    case 'Monge':
      filtrado = Handler.abilities.monge;
      break;
    case 'Necromante':
      filtrado = Handler.abilities.necromante;
      break;
    case 'Senhor das Sombras':
      filtrado = Handler.abilities.assassin;
      break;
    case 'Berserker':
      filtrado = Handler.abilities.barbarian;
      break;
    case 'Arcanjo':
      filtrado = Handler.abilities.clerigo;
      break;
    case 'Guardião da Natureza':
      filtrado = Handler.abilities.druida;
      break;
    case 'Mestre das Armas':
      filtrado = Handler.abilities.espadachim;
      break;
    case 'Senhor das Galáxias':
      filtrado = Handler.abilities.feiticeiro;
      break;
    case 'Mestre dos Elementos':
      filtrado = Handler.abilities.feiticeiro;
      break;
    case 'Conjurador Demoníaco':
      filtrado = Handler.abilities.feiticeiro;
      break;
    case 'Sacerdote':
      filtrado = Handler.abilities.monge;
      break;
    case 'Senhor das Trevas':
      filtrado = Handler.abilities.necromante;
      break;
    default:
      filtrado = Handler.abilities.assassin;
      break;
  }

  const uniquePowerFiltred = filtrado.uniquePowers.filter((f) => f.name === user.uniquePower.name);
  const abilitiesFiltred: typeof Handler.abilities.assassin.normalAbilities = [];

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

const initialChecks = async (
  user: RoleplayUserSchema,
  ctx: InteractionCommandContext,
): Promise<boolean> => {
  let pass = true;
  const motivo = [];

  if (user.life < 1) {
    if (Date.now() > user.death) {
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
          user.death - Date.now() > 3600000
            ? moment.utc(user.death - Date.now()).format('HH:mm:ss')
            : moment.utc(user.death - Date.now()).format('mm:ss'),
      }),
    });
  }
  if (user.dungeonCooldown > Date.now()) {
    pass = false;
    motivo.push({
      name: `💤 | ${ctx.locale('roleplay:initial.tired')}`,
      value: ctx.locale('roleplay:initial.tired-text', {
        time:
          user.dungeonCooldown - Date.now() > 3600000
            ? moment.utc(user.dungeonCooldown - Date.now()).format('HH:mm:ss')
            : moment.utc(user.dungeonCooldown - Date.now()).format('mm:ss'),
      }),
    });
  }

  if (user.hotelTime > Date.now()) {
    pass = false;
    motivo.push({
      name: '🏨 | Hotel',
      value: ctx.locale('roleplay:initial.hotel-text', {
        time:
          user.hotelTime - Date.now() > 3600000
            ? moment.utc(user.hotelTime - Date.now()).format('HH:mm:ss')
            : moment.utc(user.hotelTime - Date.now()).format('mm:ss'),
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
    ctx.makeMessage({ content: texto });
  }

  await ctx.client.repositories.roleplayRepository.updateUser(user.id, {
    life: user.maxLife,
    mana: user.maxMana,
  });

  return pass;
};

const confirmRegister = (user: RoleplayUserSchema, ctx: InteractionCommandContext): void => {
  switch (user.class) {
    case 'Assassino': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 5,
        damage: 25,
        mana: 20,
        maxMana: 20,
        abilityPower: 1,
        abilities: [Handler.abilities.assassin.normalAbilities[0]],
        weapon: { name: 'Adaga', damage: 5, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.assassin.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
    case 'Bárbaro': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 20,
        damage: 15,
        mana: 20,
        maxMana: 20,
        abilityPower: 1,
        abilities: [Handler.abilities.barbarian.normalAbilities[0]],
        weapon: { name: 'Machado de dois Gumes', damage: 10, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.barbarian.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
    case 'Druida': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 10,
        damage: 7,
        mana: 50,
        maxMana: 50,
        abilityPower: 3,
        abilities: [Handler.abilities.druida.normalAbilities[0]],
        weapon: { name: 'Anel da Transformação', damage: 0, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.druida.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
    case 'Espadachim': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 17,
        damage: 18,
        mana: 20,
        maxMana: 20,
        abilityPower: 1,
        abilities: [Handler.abilities.espadachim.normalAbilities[0]],
        weapon: { name: 'Sabre', damage: 7, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.espadachim.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
    case 'Feiticeiro': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 7,
        damage: 5,
        mana: 60,
        maxMana: 60,
        abilityPower: 4,
        abilities: [Handler.abilities.feiticeiro.normalAbilities[0]],
        weapon: { name: 'Cajado', damage: 5, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.feiticeiro.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
    case 'Clérigo': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 10,
        damage: 4,
        mana: 60,
        maxMana: 60,
        abilityPower: 4,
        abilities: [Handler.abilities.clerigo.normalAbilities[0]],
        weapon: { name: 'Tomo Sagrado', damage: 5, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.clerigo.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
    case 'Monge': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 18,
        damage: 14,
        mana: 20,
        maxMana: 20,
        abilityPower: 2,
        abilities: [Handler.abilities.monge.normalAbilities[0]],
        weapon: { name: 'Punhos', damage: 1, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.monge.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
    case 'Necromante': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        armor: 7,
        damage: 5,
        mana: 60,
        maxMana: 60,
        abilityPower: 4,
        abilities: [Handler.abilities.necromante.normalAbilities[0]],
        weapon: { name: 'Foice', damage: 5, type: 'Arma' },
        uniquePower: RandomFromArray(Handler.abilities.necromante.uniquePowers),
      });
      ctx.makeMessage({ content: ctx.prettyResponse('success', 'roleplay:registred') });
      break;
    }
  }
};

const evolve = (user: RoleplayUserSchema, ctx: InteractionCommandContext): void => {
  switch (user.class) {
    case 'Assassino': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        $inc: { damage: 10 },
        $push: { abilities: Handler.abilities.assassin.normalAbilities[4] },
        class: 'Senhor das Sombras',
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'roleplay:evolve', {
          class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
        }),
      });
      break;
    }
    case 'Bárbaro': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        $inc: { maxLife: 50 },
        $push: { abilities: Handler.abilities.barbarian.normalAbilities[4] },
        class: 'Berserker',
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'roleplay:evolve', {
          class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
        }),
      });
      break;
    }
    case 'Clérigo': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        $inc: { maxMana: 40 },
        $push: { abilities: Handler.abilities.clerigo.normalAbilities[4] },
        class: 'Arcanjo',
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'roleplay:evolve', {
          class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
        }),
      });
      break;
    }
    case 'Druida': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        $inc: { maxMana: 30 },
        $push: { abilities: Handler.abilities.druida.normalAbilities[4] },
        class: 'Guardião da Natureza',
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'roleplay:evolve', {
          class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
        }),
      });
      break;
    }
    case 'Espadachim': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        $inc: { damage: 10 },
        $push: { abilities: Handler.abilities.espadachim.normalAbilities[4] },
        class: 'Mestre das Armas',
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'roleplay:evolve', {
          class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
        }),
      });
      break;
    }
    case 'Feiticeiro': {
      if (user.uniquePower.name === 'Linhagem: Mística') {
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          $inc: { maxMana: 40 },
          $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[10] },
          class: 'Senhor das Galáxias',
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('warn', 'roleplay:evolve', {
            class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
          }),
        });
      }
      if (user.uniquePower.name === 'Linhagem: Dracônica') {
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          $inc: { maxMana: 40 },
          $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[11] },
          class: 'Mestre dos Elementos',
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('warn', 'roleplay:evolve', {
            class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
          }),
        });
      }
      if (user.uniquePower.name === 'Linhagem: Demoníaca') {
        ctx.client.repositories.roleplayRepository.updateUser(user.id, {
          $inc: { maxMana: 40 },
          $push: { abilities: Handler.abilities.feiticeiro.normalAbilities[12] },
          class: 'Conjurador Demoníaco',
        });
        ctx.makeMessage({
          content: ctx.prettyResponse('warn', 'roleplay:evolve', {
            class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
          }),
        });
      }
      break;
    }
    case 'Monge': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        $push: { abilities: Handler.abilities.monge.normalAbilities[4] },
        class: 'Sacerdote',
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'roleplay:evolve', {
          class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
        }),
      });
      break;
    }
    case 'Necromante': {
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        $inc: { maxMana: 40 },
        $push: { abilities: Handler.abilities.necromante.normalAbilities[4] },
        class: 'Senhor das Trevas',
      });
      ctx.makeMessage({
        content: ctx.prettyResponse('warn', 'roleplay:evolve', {
          class: ctx.locale(`roleplay:neo-classes.${user.class as 'Assassino'}`),
        }),
      });
      break;
    }
  }
};

export default {
  battle,
  confirmRegister,
  continueBattle,
  enemyShot,
  evolve,
  finalChecks,
  getAbilities,
  getEnemyByUserLevel,
  initialChecks,
  morte,
  newAbilities,
  RandomFromArray,
};
