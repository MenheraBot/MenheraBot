import InteractionCommandContext from '@structures/command/InteractionContext';
import { emojis, ROLEPLAY_CONSTANTS } from '@structures/Constants';
import Util, { actionRow } from '@utils/Util';
import { MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js-light';
import moment from 'moment';
import Handler from './Handler';
import {
  AttackChoice,
  BattleChoice,
  DungeonLevels,
  IncomingAttackChoice,
  Mob,
  RoleplayUserSchema,
} from './Types';
import RPGUtil from './Utils';
import { getUserMaxLife, getUserMaxMana } from './utils/Calculations';

const RandomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getEnemyByUserLevel = (
  user: RoleplayUserSchema,
  type: BattleChoice,
  dungeonLevel?: DungeonLevels,
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
    /*   ctx.makeMessage({
      content: ctx.prettyResponse('error', 'commands:dungeon.min-level-warn', {
        level: MaxMinLevel,
        toGo: validLevels[dungeonLevel].minUserLevel,
        wantLevel: dungeonLevel,
      }), 
    }); 
    */
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
      if (user.life > getUserMaxLife(user)) user.life = getUserMaxLife(user);
    }
    danoUser = /* user.abilityPower */ 1 * Number(escolha.damage);
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
  const habilidades = 'a'; // getAbilities(user);

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
  habilidades: 'a', // Array<NormalAbility | UniquePower>,
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
    /*   if (user.uniquePower.name === 'Morte Instantânea') {
      habilidades.splice(
        habilidades.findIndex((i) => i.name === 'Morte Instantânea'),
        1,
      );
    } */
  }
  /*   habilidades.forEach((hab) => {
    options.push(hab);
  }); */

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
    if (user.experience >= /* user.nextLevelXp */ 1) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        xp: 0,
        level: user.level + 1,
        nextLevelXp: /* user.nextLevelXp */ 1 * 2,
        maxLife: getUserMaxLife(user) + 10,
        maxMana: getUserMaxMana(user) + 10,
        damage: user.damage + 3,
        armor: user.armor + 2,
      });
      ctx.makeMessage({ content: texto });
    }
  } else if (user.level > 4 && user.level < 10) {
    if (user.experience >= /* user.nextLevelXp */ 1) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        xp: 0,
        level: user.level + 1,
        nextLevelXp: /* user.nextLevelXp */ 1 * 2,
        maxLife: getUserMaxLife(user) + 20,
        maxMana: getUserMaxMana(user) + 15,
        damage: user.damage + 5,
        armor: user.armor + 3,
      });
      ctx.makeMessage({ content: texto });
    }
  } else if (user.level > 9 && user.level < 29) {
    if (user.experience >= /* user.nextLevelXp */ 1) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        level: user.level + 1,
        nextLevelXp: /* user.nextLevelXp */ 1 * 2,
        maxLife: /* user.maxLife + */ 50,
        maxMana: /* user.maxMana +  */ 20,
        damage: user.damage + 7,
        armor: user.armor + 5,
      });
      ctx.makeMessage({ content: texto });
    }
  } else if (user.level >= 29) {
    if (user.experience >= /* user.nextLevelXp */ 1) {
      texto += '**<a:LevelUp:760954035779272755> LEVEL UP <a:LevelUp:760954035779272755>**';
      ctx.client.repositories.roleplayRepository.updateUser(user.id, {
        xp: 0,
        level: user.level + 1,
        nextLevelXp: /* user.nextLevelXp */ 1 * 2,
        maxLife: getUserMaxLife(user) + 50,
        maxMana: getUserMaxMana(user) + 50,
        damage: user.damage + 10,
        armor: user.armor + 2,
      });
      ctx.makeMessage({ content: texto });
    }
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
/* 
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
 */
const initialChecks = async (
  user: RoleplayUserSchema,
  ctx: InteractionCommandContext,
): Promise<boolean> => {
  let pass = true;
  const motivo = [];

  if (user.life < 1) {
    if (Date.now() > user.death) {
      user.life = /* user.maxLife; */ 1;
      user.mana = /* user.maxMana; */ 1;
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
    life: /* user.maxLife */ 1,
    mana: /* user.maxMana */ 1,
  });

  return pass;
};

export default {
  battle,
  continueBattle,
  enemyShot,
  finalChecks,
  getEnemyByUserLevel,
  initialChecks,
  morte,
  RandomFromArray,
};
