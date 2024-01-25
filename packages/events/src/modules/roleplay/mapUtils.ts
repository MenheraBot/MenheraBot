import { Location } from './types';

const calculateTravelDistance = (from: Location, to: Location): number => {
  const toTravelX = Math.abs(from[0] - to[0]);
  const toTravelY = Math.abs(from[1] - to[1]);

  return toTravelX + toTravelY;
};

export { calculateTravelDistance };
