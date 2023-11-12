import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database';
import { INITIAL_LIMIT_FOR_SILO, SILO_LIMIT_INCREASE_BY_LEVEL } from './constants';

const checkNeededItems = (need: QuantitativePlant[], has: QuantitativePlant[]): boolean =>
  need.every((needed) =>
    has.some((user) => user.plant === needed.plant && user.amount >= needed.amount),
  );

const removeItems = (
  user: QuantitativePlant[],
  toRemove: QuantitativePlant[],
): QuantitativePlant[] =>
  user.reduce<QuantitativePlant[]>((p, c) => {
    const remove = toRemove.find((a) => a.plant === c.plant);

    if (!remove) {
      p.push(c);
      return p;
    }

    const newAmount = c.amount - remove.amount;

    if (newAmount > 0) p.push({ plant: c.plant, amount: newAmount });

    return p;
  }, []);

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
