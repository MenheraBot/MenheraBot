import {
  AbilityEffect,
  EquipmentItem,
  BattleUserTurn,
  EnemyDrops,
  HolyBlessings,
  LeveledItem,
  ReadyToBattleEnemy,
  RoleplayUserSchema,
  UserBattleEntity,
  UserCooldown,
  InventoryItem,
} from '@roleplay/Types';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { LEVEL_UP_BLESSES } from '@roleplay/Constants';
import { IReturnData } from '@custom_types/Menhera';
import { moreThanAnHour, RandomFromArray } from '@utils/Util';
import { EmbedFieldData, MessageButton } from 'discord.js-light';
import moment from 'moment';
import { TFunction } from 'i18next';
import { getEnemies, getItemById } from './DataUtils';
import { nextLevelXp } from './Calculations';

export const prepareUserForDungeon = (user: RoleplayUserSchema): UserBattleEntity => {
  // @ts-expect-error nyaa
  user.effects = [];
  return user as UserBattleEntity;
};

export const makeCloseCommandButton = (baseId: number, translate: TFunction): MessageButton =>
  new MessageButton()
    .setCustomId(`${baseId} | CLOSE_COMMAND`)
    .setStyle('DANGER')
    .setLabel(translate('common:exit-command'));

export const canGoToDungeon = (
  user: RoleplayUserSchema,
  ctx: InteractionCommandContext,
): { canGo: boolean; reason: EmbedFieldData[] } => {
  let canGo = true;
  const reason: EmbedFieldData[] = [];

  user.cooldowns.forEach((cd) => {
    if (cd?.data === 'DEATH') {
      canGo = false;
      reason.push({
        name: ctx.locale('roleplay:cooldowns.death'),
        value: ctx.locale('roleplay:cooldowns.death-description'),
      });
      return;
    }
    if (cd.until > Date.now()) {
      if (cd.reason === 'church' && cd.data === 'COOLDOWN') return;
      canGo = false;
      reason.push({
        name: ctx.locale(
          `roleplay:cooldowns.${cd?.data === 'DEATH' ? 'death' : (cd.reason as 'death')}`,
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
          },
        ),
      });
    }
  });

  return { canGo, reason };
};

export const getDungeonEnemy = (dungeonLevel: number, userLevel: number): ReadyToBattleEnemy => {
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

  return enemyData;
};

export const isDead = (entity: unknown & { life: number }): boolean => entity.life <= 0;

export const isInventoryFull = (user: RoleplayUserSchema): boolean => {
  const userBackPack = getItemById<EquipmentItem<'backpack'>>(user.backpack.id);

  if (
    user.inventory.reduce((p, c) => p + c.amount, 0) >=
    userBackPack.data.levels[user.backpack.level].value
  )
    return true;
  return false;
};

export const getFreeInventorySpace = (user: RoleplayUserSchema): number => {
  const userBackPack = getItemById(user.backpack.id) as IReturnData<EquipmentItem<'backpack'>>;

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
export const getEnemyLoot = (loots: EnemyDrops[]): EnemyDrops['loots'] => {
  const chance = Math.floor(Math.random() * 100);

  let accumulator = loots.reduce((p, c) => p + c.probability, 0);

  const mapedChanges: { loots: number[]; probabilities: number[] }[] = loots.map((a) => {
    const toReturn = [accumulator - a.probability, accumulator];
    accumulator -= a.probability;
    return { loots: a.loots, probabilities: toReturn };
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const data of mapedChanges) {
    const [min, max] = data.probabilities;
    if (chance >= min && chance <= max) {
      return data.loots;
    }
  }
  return [];
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

export const invertBattleTurn = (lastTurn: BattleUserTurn): BattleUserTurn =>
  lastTurn === 'attacker' ? 'defender' : 'attacker';

export const getAbilityDamageFromEffects = (
  effects: AbilityEffect[],
  userIntelligence: number,
  abilityLevel: number,
): number =>
  effects.reduce((p, c) => {
    if (c.effectType === 'damage') {
      const abilityDamage = Math.floor(
        c.effectValue +
          userIntelligence * (c.effectValueByIntelligence / 100) +
          c.effectValuePerLevel * abilityLevel,
      );

      return p + abilityDamage;
    }

    return p;
  }, 0);

export const packDrops = (drops: number[]): InventoryItem[] =>
  drops.reduce<InventoryItem[]>((acc, itemId) => {
    const item = acc.find((a) => a.id === itemId);

    if (!item) {
      acc.push({ id: itemId, level: 1, amount: 1 });
      return acc;
    }

    item.amount += 1;
    return acc;
  }, []);

export const userHasAllDrops = (
  inventory: RoleplayUserSchema['inventory'],
  drops: number[],
): boolean => {
  const packedItems = packDrops(drops);

  return packedItems.every((item) =>
    inventory.some(
      (itemInInventory) => itemInInventory.id === item.id && itemInInventory.amount >= item.amount,
    ),
  );
};
