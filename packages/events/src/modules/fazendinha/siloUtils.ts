import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database';
import { INITIAL_LIMIT_FOR_SILO, SILO_LIMIT_INCREASE_BY_LEVEL } from './constants';

const checkNeededItems = (need: QuantitativePlant[], has: QuantitativePlant[]): boolean =>
  need.every((needed) =>
    has.some((user) => user.plant === needed.plant && user.amount >= needed.amount),
  );

const removeItems = (
  user: QuantitativePlant[],
  toRemove: QuantitativePlant[],
): QuantitativePlant[] => {
  const final: QuantitativePlant[] = [];

  toRemove.forEach((item) => {
    const fromUser = user.find((a) => a.plant === item.plant);

    if (!fromUser) return;

    fromUser.amount -= item.amount;

    if (fromUser.amount > 0) final.push(fromUser);
  });

  return final;
};

interface SiloLimits {
  limit: number;
  used: number;
}

const getSiloLimits = (user: DatabaseFarmerSchema): SiloLimits => {
  const countQuantitative = (items: QuantitativePlant[]): number =>
    items.reduce((p, c) => p + (c.amount > 0 ? c.amount : 0), 0);

  const used = countQuantitative(user.silo) + countQuantitative(user.seeds);
  const limit = INITIAL_LIMIT_FOR_SILO + SILO_LIMIT_INCREASE_BY_LEVEL * user.siloUpgrades;

  return { used, limit };
};

export { checkNeededItems, removeItems, getSiloLimits };
