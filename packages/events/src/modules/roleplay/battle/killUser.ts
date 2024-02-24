import { DatabaseCharacterSchema } from '../../../types/database';
import { hoursToMillis } from '../../../utils/miscUtils';
import { RESURRECT_TIME_IN_HOURS } from '../constants';
import { Action } from '../types';

const getKillQuery = (character: DatabaseCharacterSchema): Partial<DatabaseCharacterSchema> => {
  const extraQuery: Partial<DatabaseCharacterSchema> = {};
  if (character.currentAction.type === Action.TRAVEL) extraQuery.location = character.location;

  return {
    life: 0,
    currentAction: {
      type: Action.DEATH,
      reviveAt: Date.now() + hoursToMillis(RESURRECT_TIME_IN_HOURS),
    },
    ...extraQuery,
  };
};

export { getKillQuery };
