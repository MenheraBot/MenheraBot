import roleplayRepository from '../../../database/repositories/roleplayRepository';
import { DatabaseCharacterSchema } from '../../../types/database';
import { GenericContext } from '../../../types/menhera';
import { hoursToMillis, randomFromArray } from '../../../utils/miscUtils';
import { finishAdventure } from '../adventureManager';
import { RESURRECT_TIME_IN_HOURS } from '../constants';
import { Enemies } from '../data/enemies';
import { Items } from '../data/items';
import inventoryManager from '../inventoryManager';
import { InBattleUser, PlayerVsEnviroment } from '../types';

const checkDeath = (entity: { life: number }): boolean => entity.life <= 0;

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
  };
};

const userWasKilled = (ctx: GenericContext, adventure: PlayerVsEnviroment): void => {
  finishAdventure(ctx, adventure, `Você foi morto!`, {
    deadUntil: Date.now() + hoursToMillis(RESURRECT_TIME_IN_HOURS),
  });
};

const enemyWasKilled = (ctx: GenericContext, adventure: PlayerVsEnviroment): void => {
  const dropedItem = randomFromArray(
    Enemies[adventure.enemy.id as 1].drops[adventure.enemy.level - 1],
  );

  inventoryManager.addItems(adventure.user.inventory, [dropedItem]);

  finishAdventure(
    ctx,
    adventure,
    `Tu matou o ${adventure.enemy.$devName} Lvl. ${
      adventure.enemy.level
    }\nEm seu corpo, tu encontrou ${dropedItem.amount} ${Items[dropedItem.id as 1].$devName} Lvl. ${
      dropedItem.level
    }`,
  );
};

const didUserResurrect = async (user: DatabaseCharacterSchema): Promise<boolean> => {
  if (user.deadUntil > Date.now()) return false;

  await roleplayRepository.updateCharacter(user.id, { life: 100 });
  user.life = 100;

  return true;
};

export {
  checkDeath,
  keepNumbersPositive,
  extractBattleUserInfoToCharacter,
  userWasKilled,
  enemyWasKilled,
  didUserResurrect,
};
