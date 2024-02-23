import roleplayRepository from '../../database/repositories/roleplayRepository';
import { DatabaseCharacterSchema } from '../../types/database';
import { getElapsedMinutes } from '../../utils/miscUtils';
import {
  MAX_CHARACTER_ENERGY,
  MAX_CHARACTER_LIFE,
  STATUS_RECOVERY_IN_CHURCH_PER_MINUTE,
} from './constants';
import { manipulateUserLocation } from './mapUtils';
import { Action } from './types';

const manipulateUserVitality = (character: DatabaseCharacterSchema): void => {
  const action = character.currentAction;
  if (action.type !== Action.CHURCH) return;

  const elapsedMinutes = getElapsedMinutes(action.startAt);

  const toAddLife = Math.round(elapsedMinutes * STATUS_RECOVERY_IN_CHURCH_PER_MINUTE.life);
  const toAddEnergy = Math.round(elapsedMinutes * STATUS_RECOVERY_IN_CHURCH_PER_MINUTE.energy);

  character.life = Math.min(character.life + toAddLife, MAX_CHARACTER_LIFE);
  character.energy = Math.min(character.energy + toAddEnergy, MAX_CHARACTER_ENERGY);
};

const manipulateDeath = (character: DatabaseCharacterSchema): void => {
  const action = character.currentAction;
  if (action.type !== Action.DEATH) return;

  if (action.reviveAt > Date.now()) return;

  roleplayRepository.updateCharacter(character.id, {
    life: MAX_CHARACTER_LIFE,
    energy: MAX_CHARACTER_ENERGY,
    currentAction: { type: Action.NONE },
  });

  character.life = MAX_CHARACTER_LIFE;
  character.energy = MAX_CHARACTER_ENERGY;
  character.currentAction = { type: Action.NONE };
};

const manipulateCharacterStatus = async (
  character: DatabaseCharacterSchema,
): Promise<DatabaseCharacterSchema> => {
  switch (character.currentAction.type) {
    case Action.CHURCH:
      manipulateUserVitality(character);
      break;
    case Action.DEATH:
      manipulateDeath(character);
      break;
    case Action.TRAVEL:
      manipulateUserLocation(character);
      break;
  }

  return character;
};

export { manipulateCharacterStatus };
