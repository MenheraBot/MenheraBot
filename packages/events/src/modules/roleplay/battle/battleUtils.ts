import { DatabaseCharacterSchema } from '../../../types/database';
import { InteractionContext } from '../../../types/menhera';
import { hoursToMillis } from '../../../utils/miscUtils';
import { finishAdventure } from '../adventureManager';
import { RESSURECT_TIME_IN_HOURS } from '../constants';
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
  };
};

const userWasKilled = (ctx: InteractionContext, adventure: PlayerVsEnviroment): void => {
  finishAdventure(ctx, adventure, `Você foi morto!`, {
    deadUntil: Date.now() + hoursToMillis(RESSURECT_TIME_IN_HOURS),
  });
};

export { checkDeath, keepNumbersPositive, extractBattleUserInfoToCharacter, userWasKilled };
