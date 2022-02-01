import {
  BackPackItem,
  LeveledItem,
  ReadyToBattleEnemy,
  RoleplayUserSchema,
  UserCooldown,
} from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { IReturnData } from '@utils/Types';
import { moreThanAnHour, RandomFromArray } from '@utils/Util';
import { EmbedFieldData } from 'discord.js-light';
import moment from 'moment';
import { getEnemies, getItemById } from './DataUtils';

export const canGoToDungeon = (
  user: RoleplayUserSchema,
  ctx: InteractionCommandContext,
): { canGo: boolean; reason: EmbedFieldData[] } => {
  let canGo = true;
  const reason: EmbedFieldData[] = [];

  user.cooldowns.forEach((cd) => {
    if (cd.until > Date.now()) {
      canGo = false;
      reason.push({
        name: ctx.locale(`roleplay:cooldowns.${cd.reason as 'death'}`),
        value: ctx.locale(`roleplay:cooldowns.${cd.reason as 'death'}-description`, {
          time: moment
            .utc(cd.until - Date.now())
            .format(moreThanAnHour(cd.until - Date.now()) ? 'HH:mm:ss' : 'mm:ss'),
          subtime: ctx.locale(`common:${moreThanAnHour(cd.until) ? 'hours' : 'minutes'}`),
        }),
      });
    }
  });

  return { canGo, reason };
};

export const getDungeonEnemy = (dungeonLevel: number, userLevel: number): ReadyToBattleEnemy => {
  const availableEnemies = getEnemies().filter((a) => a.data.dungeonLevels.includes(dungeonLevel));

  const enemy = RandomFromArray(availableEnemies);

  const enemyLevel = (userLevel % 5) * 10 + Math.floor(Math.random() * 10) + 1;

  const enemyData: ReadyToBattleEnemy = {
    id: enemy.id,
    life: enemy.data.baseLife + enemy.data.perLevel.baseLife * enemyLevel,
    armor: enemy.data.baseArmor + enemy.data.perLevel.baseArmor * enemyLevel,
    damage: enemy.data.baseDamage + enemy.data.perLevel.baseDamage * enemyLevel,
    experience: enemy.data.experience + enemy.data.perLevel.experience * enemyLevel,
    level: enemyLevel,
    loots: enemy.data.loots,
  };

  return enemyData;
};

export const isDead = (entity: unknown & { life: number }): boolean => entity.life <= 0;

export const isInventoryFull = (user: RoleplayUserSchema): boolean => {
  const userBackPack = getItemById(user.backpack.id) as IReturnData<BackPackItem>;

  if (
    user.inventory.reduce((p, c) => p + c.amount, 0) >=
    userBackPack.data.capacity + userBackPack.data.perLevel * user.backpack.level
  )
    return true;
  return false;
};

export const getFreeInventorySpace = (user: RoleplayUserSchema): number => {
  const userBackPack = getItemById(user.backpack.id) as IReturnData<BackPackItem>;

  const usedSpace = user.inventory.reduce((p, c) => p + c.amount, 0);

  return userBackPack.data.capacity + userBackPack.data.perLevel * user.backpack.level - usedSpace;
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

export const makeCooldown = (
  cooldowns: UserCooldown[],
  newCooldown: UserCooldown,
): RoleplayUserSchema['cooldowns'] => {
  const finded = cooldowns.find((a) => a.reason === newCooldown.reason);

  if (finded) finded.until = newCooldown.until;
  else cooldowns.push(newCooldown);
  return cooldowns;
};
