import {
  EnemyDrops,
  HolyBlessings,
  LeveledItem,
  ReadyToBattleEnemy,
  RoleplayUserSchema,
  UserBattleEntity,
  UserCooldown,
} from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { LEVEL_UP_BLESSES } from '@roleplay/Constants';
import { moreThanAnHour, RandomFromArray } from '@utils/Util';
import { EmbedFieldData, MessageButton } from 'discord.js-light';
import moment from 'moment';
import { TFunction } from 'i18next';
import { getEnemies, getEquipmentById } from './DataUtils';
import { nextLevelXp } from './Calculations';

export const prepareUserForDungeon = (user: RoleplayUserSchema): UserBattleEntity => {
  // @ts-expect-error Os negocio nao sao
  user.didParticipate = true;
  // @ts-expect-error Os negocio nao sao
  user.effects = [];
  // @ts-expect-error Os negocio nao sao
  user.abilitiesCooldowns = [];
  return user as unknown as UserBattleEntity;
};

export const makeCloseCommandButton = (baseId: number, translate: TFunction): MessageButton =>
  new MessageButton()
    .setCustomId(`${baseId} | CLOSE_COMMAND`)
    .setStyle('DANGER')
    .setLabel(translate('common:exit-command'));

export const canUsersGoToDungeon = (
  users: RoleplayUserSchema[],
  ctx: InteractionCommandContext,
): { canGo: boolean; reason: EmbedFieldData[] } => {
  const reason: EmbedFieldData[] = [];

  users.forEach((user) => {
    user.cooldowns.forEach((cd) => {
      if (cd?.data === 'DEATH') {
        reason.push({
          name: ctx.locale('roleplay:cooldowns.death', {
            user: ctx.client.users.cache.get(user.id)?.username ?? `ID: ${user.id}`,
          }),
          value: ctx.locale('roleplay:cooldowns.death-description', {
            user: ctx.client.users.cache.get(user.id)?.username ?? `ID: ${user.id}`,
          }),
        });
        return;
      }

      if (cd.until > Date.now()) {
        if (cd.reason === 'church' && cd.data === 'COOLDOWN') return;
        reason.push({
          name: ctx.locale(
            `roleplay:cooldowns.${cd?.data === 'DEATH' ? 'death' : (cd.reason as 'death')}`,
            {
              user: ctx.client.users.cache.get(user.id)?.username ?? `ID: ${user.id}`,
            },
          ),
          value: ctx.locale(
            `roleplay:cooldowns.${
              cd?.data === 'DEATH' ? 'death' : (cd.reason as 'death')
            }-description`,
            {
              time: moment
                .utc(cd.until - Date.now())
                .format(moreThanAnHour(cd.until - Date.now()) ? 'HH:mm:ss' : 'mm:ss'),
              subtime: ctx.locale(
                `common:${moreThanAnHour(cd.until - Date.now()) ? 'hours' : 'minutes'}`,
              ),
              user: ctx.client.users.cache.get(user.id)?.username ?? `ID: ${user.id}`,
            },
          ),
        });
      }
    });
  });

  return { canGo: reason.length === 0, reason };
};

export const getDungeonEnemies = (
  dungeonLevel: number,
  userLevel: number,
): ReadyToBattleEnemy[] => {
  const availableEnemies = getEnemies().filter((a) => a.data.dungeonLevels.includes(dungeonLevel));

  const enemy = RandomFromArray(availableEnemies);

  const enemyPhase = dungeonLevel - 1 + Math.floor(userLevel / 4);

  const enemyData: ReadyToBattleEnemy = {
    id: enemy.id,
    life: Math.floor(enemy.data.baseLife + enemy.data.statsPerPhase.baseLife * enemyPhase),
    armor: Math.floor(enemy.data.baseArmor + enemy.data.statsPerPhase.baseArmor * enemyPhase),
    damage: Math.floor(enemy.data.baseDamage + enemy.data.statsPerPhase.baseDamage * enemyPhase),
    experience: Math.floor(
      enemy.data.experience + enemy.data.statsPerPhase.experience * enemyPhase,
    ),
    effects: [],
    agility: Math.floor(enemy.data.baseAgility + enemy.data.statsPerPhase.baseAgility * enemyPhase),
    level: Math.floor(enemyPhase * 5),
    loots: enemy.data.loots,
  };

  // TODO: Better way of gettin lots of enemies
  return [{ ...enemyData }, { ...enemyData }, { ...enemyData }];
};

export const isInventoryFull = (user: RoleplayUserSchema): boolean => {
  const userBackPack = getEquipmentById<'backpack'>(user.backpack.id);

  if (
    user.inventory.reduce((p, c) => p + c.amount, 0) >=
    userBackPack.data.levels[user.backpack.level].value
  )
    return true;
  return false;
};

export const getFreeInventorySpace = (user: RoleplayUserSchema): number => {
  const userBackPack = getEquipmentById<'backpack'>(user.backpack.id);

  const usedSpace = user.inventory.reduce((p, c) => p + c.amount, 0);

  return userBackPack.data.levels[user.backpack.level].value - usedSpace;
};

export const addToInventory = (
  items: LeveledItem[],
  inventory: RoleplayUserSchema['inventory'],
): RoleplayUserSchema['inventory'] => {
  items.forEach((a) => {
    const inInventory = inventory.find((b) => b.id === a.id && b.level === a.level);
    if (inInventory) inInventory.amount += 1;
    else inventory.push({ amount: 1, ...a });
  });

  return inventory;
};

export const removeFromInventory = (
  items: LeveledItem[],
  inventory: RoleplayUserSchema['inventory'],
): RoleplayUserSchema['inventory'] => {
  items.forEach((a) => {
    const inInventory = inventory.find((b) => b.id === a.id && b.level === a.level);
    if (inInventory) {
      inInventory.amount -= 1;
      if (inInventory.amount <= 0)
        inventory.splice(
          inventory.findIndex((b) => b.id === a.id && b.level === a.level),
          1,
        );
    }
  });

  return inventory;
};

export const makeCooldown = (
  cooldowns: UserCooldown[],
  newCooldown: UserCooldown,
): RoleplayUserSchema['cooldowns'] => {
  const finded = cooldowns.find((a) => a.reason === newCooldown.reason);

  if (finded) {
    finded.until = newCooldown.until;
    if (newCooldown.data) finded.data = newCooldown.data;
  } else cooldowns.push(newCooldown);
  return cooldowns;
};

// TODO: new enemy loot system
export const getEnemiesLoots = (lootsArray: EnemyDrops[][]): EnemyDrops['loots'] => {
  const toReturn: number[] = [];

  const chance = Math.floor(Math.random() * 100);

  lootsArray.forEach((loots) => {
    let accumulator = loots.reduce((p, c) => p + c.probability, 0);

    const mapedChanges: { loots: number[]; probabilities: number[] }[] = loots.map((a) => {
      const returning = [accumulator - a.probability, accumulator];
      accumulator -= a.probability;
      return { loots: a.loots, probabilities: returning };
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const data of mapedChanges) {
      const [min, max] = data.probabilities;
      if (chance >= min && chance <= max) {
        toReturn.push(...data.loots);
        return;
      }
    }
  });

  return toReturn;
};

export const makeLevelUp = (
  user: RoleplayUserSchema,
): { level: number; holyBlessings: HolyBlessings } => {
  if (user.experience >= nextLevelXp(user.level)) {
    user.holyBlessings.ability += LEVEL_UP_BLESSES[user.level].ability;
    user.holyBlessings.battle += LEVEL_UP_BLESSES[user.level].battle;
    user.holyBlessings.vitality += LEVEL_UP_BLESSES[user.level].vitality;
    user.level += 1;
    user.experience = 0;
  }

  return { level: user.level, holyBlessings: user.holyBlessings };
};

const chunkify = <T>(arr: T[], parts: number): T[][] => {
  const result = [];
  for (let i = parts; i > 0; i--) result.push(arr.splice(0, Math.ceil(arr.length / i)));
  return result;
};

export const getUsersLoots = (
  users: UserBattleEntity[],
  loots: EnemyDrops['loots'],
): { id: string; loots: EnemyDrops['loots'] }[] => {
  const canGetLoots = users.filter((u) => u.didParticipate).length;

  const lootsPerUser = chunkify(loots, canGetLoots);

  let acc = 0;

  return users.map((u) => ({ id: u.id, loots: u.didParticipate ? lootsPerUser[acc++] : [] }));
};
