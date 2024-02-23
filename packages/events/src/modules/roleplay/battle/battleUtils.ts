import { DatabaseCharacterSchema } from '../../../types/database';
import { randomFromArray } from '../../../utils/miscUtils';
import { Enemies } from '../data/enemies';
import inventoryUtils from '../inventoryUtils';
import { InBattleUser, InventoryItem, PlayerVsEnviroment } from '../types';

const checkDeath = (entity: { life: number; energy?: number }): boolean =>
  entity.life <= 0 || (typeof entity.energy !== 'undefined' && entity.energy <= 0);

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

export { checkDeath, keepNumbersPositive, extractBattleUserInfoToCharacter, lootEnemy };
