import { ButtonStyles } from 'discordeno/types';
import roleplayRepository from '../../database/repositories/roleplayRepository';
import { DatabaseCharacterSchema } from '../../types/database';
import { MINUTES_TO_TRAVEL_ONE_BLOCK, TOTAL_MAP_SIZE } from './constants';
import { Action, Location, TravelAction } from './types';
import { getElapsedMinutes } from '../../utils/miscUtils';

const calculateTravelDistance = (from: Location, to: Location): number => {
  const toTravelX = Math.abs(from[0] - to[0]);
  const toTravelY = Math.abs(from[1] - to[1]);

  return toTravelX + toTravelY;
};

const calculateTravelTime = (from: Location, to: Location): number => {
  const distanceToTravel = calculateTravelDistance(from, to);
  return 1000 * 60 * MINUTES_TO_TRAVEL_ONE_BLOCK * distanceToTravel;
};

const manipulateUserLocation = (character: DatabaseCharacterSchema): void => {
  const isTravelling = character.currentAction.type === Action.TRAVEL;

  if (!isTravelling) return;

  const action = character.currentAction as TravelAction;
  const currentTime = Date.now();

  const finishAt = action.startAt + calculateTravelTime(action.from, action.to);

  if (currentTime >= finishAt) {
    roleplayRepository.updateCharacter(character.id, { currentAction: { type: Action.NONE } });
    character.currentAction = { type: Action.NONE };
    return;
  }

  const elapsedMinutes = getElapsedMinutes(action.startAt);

  const blocksWalked = Math.round(elapsedMinutes / MINUTES_TO_TRAVEL_ONE_BLOCK);

  let x = action.from[0];
  let y = action.from[1];

  const goToLeftX = action.from[0] > action.to[0];
  const goToBottomY = action.from[1] > action.to[1];

  let addToX = true;

  for (let i = 0; i < blocksWalked; i++) {
    if (x !== action.to[0] && addToX) {
      x += goToLeftX ? -1 : 1;
      if (y !== action.to[1]) addToX = !addToX;
    } else {
      y += goToBottomY ? -1 : 1;
      if (x !== action.to[0]) addToX = !addToX;
    }
  }

  character.location = [x, y];
};

const getInTravelMapButtons = (
  startAt: number,
  start: Location,
  end: Location,
  current: Location,
): ButtonStyles[][] => {
  const map = Array.from({ length: TOTAL_MAP_SIZE[0] }).map(() =>
    Array.from({ length: TOTAL_MAP_SIZE[1] }).map(() => ButtonStyles.Primary),
  );

  const elapsedMinutes = getElapsedMinutes(startAt);

  const blocksWalked = Math.round(elapsedMinutes / MINUTES_TO_TRAVEL_ONE_BLOCK);

  const totalBlocks = calculateTravelDistance(start, end);

  let x = start[0];
  let y = start[1];

  const goToLeftX = start[0] > end[0];
  const goToBottomY = start[1] > end[1];

  let addToX = true;

  for (let i = 0; i < totalBlocks; i++) {
    if (i === 0 && blocksWalked > 0) map[x][y] = ButtonStyles.Danger;

    if (x !== end[0] && addToX) {
      x += goToLeftX ? -1 : 1;
      map[x][y] = i < blocksWalked ? ButtonStyles.Danger : ButtonStyles.Secondary;
      if (y !== end[1]) addToX = !addToX;
    } else {
      y += goToBottomY ? -1 : 1;
      map[x][y] = i < blocksWalked ? ButtonStyles.Danger : ButtonStyles.Secondary;
      if (x !== end[0]) addToX = !addToX;
    }
  }

  map[current[0]][current[1]] = ButtonStyles.Success;

  return map;
};

export {
  calculateTravelDistance,
  calculateTravelTime,
  manipulateUserLocation,
  getInTravelMapButtons,
};
