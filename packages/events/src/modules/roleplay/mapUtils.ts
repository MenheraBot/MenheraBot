import { MINUTES_TO_TRAVEL_ONE_BLOCK } from './constants';
import { Location } from './types';

const calculateTravelDistance = (from: Location, to: Location): number => {
  const toTravelX = Math.abs(from[0] - to[0]);
  const toTravelY = Math.abs(from[1] - to[1]);

  return toTravelX + toTravelY;
};

const calculateTravelTime = (from: Location, to: Location): number => {
  const distanceToTravel = calculateTravelDistance(from, to);
  return 1000 * 60 * MINUTES_TO_TRAVEL_ONE_BLOCK * distanceToTravel;
};

export { calculateTravelDistance, calculateTravelTime };
