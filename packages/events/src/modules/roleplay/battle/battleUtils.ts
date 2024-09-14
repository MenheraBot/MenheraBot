import { DatabaseCharacterSchema } from '../../../types/database';
import { randomFromArray } from '../../../utils/miscUtils';
import { MAX_CHARACTER_ENERGY, MAX_CHARACTER_LIFE } from '../constants';
import { Enemies } from '../data/enemies';
import inventoryUtils from '../inventoryUtils';
import { InBattleUser, InventoryItem, PlayerVsEnviroment } from '../types';

const checkDeath = (entity: { life: number; energy?: number }): boolean =>
  entity.life <= 0 || (typeof entity.energy !== 'undefined' && entity.energy <= 0);

const keepLimitsOk = (user: InBattleUser): void => {
  user.life = Math.min(user.life, MAX_CHARACTER_LIFE);
  user.energy = Math.min(user.energy, MAX_CHARACTER_ENERGY);
};

const keepNumbersPositive = (object: Record<string, unknown>): void => {
  Object.entries(object).forEach(([name, value]) => {
    if (typeof value === 'number') object[name] = Math.max(0, object[name] as number);
  });
};

const extractBattleUserInfoToCharacter = (user: InBattleUser): Partial<DatabaseCharacterSchema> => {
  keepNumbersPositive(user);

  return {
    energy: user.energy,
    life: user.life,
    inventory: user.inventory,
    abilities: user.abilitites,
  };
};

const lootEnemy = (adventure: PlayerVsEnviroment): InventoryItem => {
  const droppedItem = randomFromArray(Enemies[adventure.enemy.id as 1].drops) as {
    id: 1;
    amount: number;
  };

  inventoryUtils.addItems(adventure.user.inventory, [droppedItem]);

  return droppedItem;
};

export {
  checkDeath,
  keepNumbersPositive,
  extractBattleUserInfoToCharacter,
  lootEnemy,
  keepLimitsOk,
};
