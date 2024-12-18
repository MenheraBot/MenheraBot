import {
  DatabaseFarmerSchema,
  QuantitativeItem,
  QuantitativePlant,
  QuantitativeSeed,
} from '../../types/database';
import { INITIAL_LIMIT_FOR_SILO, SILO_LIMIT_INCREASE_BY_LEVEL } from './constants';

type QuantitativePlantItem = QuantitativePlant | QuantitativeSeed;

const checkNeededItems = (
  need: Array<QuantitativePlantItem>,
  has: Array<QuantitativePlantItem>,
): boolean =>
  need.every((needed) =>
    has.some((user) => {
      const userHas = 'weight' in user ? user.weight : user.amount;
      const userNeed = 'weight' in needed ? needed.weight : needed.amount;

      return user.plant === needed.plant && userHas >= userNeed;
    }),
  );

const addItems = <T extends QuantitativePlantItem>(user: T[], toAdd: T[]): T[] =>
  toAdd.reduce<T[]>((p, c) => {
    const fromUser = p.find((a) => a.plant === c.plant);

    if (!fromUser) {
      p.push(c);
      return p;
    }

    const userHas = 'weight' in fromUser ? fromUser.weight : fromUser.amount;
    const amountToAdd = 'weight' in c ? c.weight : c.amount;

    if ('weight' in fromUser) fromUser.weight = userHas <= 0 ? amountToAdd : userHas + amountToAdd;
    else fromUser.amount = userHas <= 0 ? amountToAdd : userHas + amountToAdd;

    return p;
  }, user);

const removeItems = <T extends QuantitativePlantItem>(user: T[], toRemove: T[]): T[] =>
  user.reduce<T[]>((p, c) => {
    const remove = toRemove.find((a) => a.plant === c.plant);

    if (!remove) {
      p.push(c);
      return p;
    }

    const removeAmount = 'weight' in remove ? remove.weight : remove.amount;
    const currentAmount = 'weight' in c ? c.weight : c.amount;

    const newAmount = currentAmount - removeAmount;

    if (newAmount > 0)
      (p as QuantitativeSeed[]).push({
        plant: c.plant,
        [('weight' in c ? 'weight' : 'amount') as 'amount']: newAmount,
      });

    return p;
  }, []);

interface SiloLimits {
  limit: number;
  used: number;
}

const getSiloLimits = (user: DatabaseFarmerSchema): SiloLimits => {
  const countQuantitative = (items: Array<QuantitativePlantItem | QuantitativeItem>): number =>
    items.reduce(
      (p, c) =>
        p +
        ((c as QuantitativeSeed)[('weight' in c ? 'weight' : 'amount') as 'amount'] > 0
          ? (c as QuantitativeSeed)[('weight' in c ? 'weight' : 'amount') as 'amount']
          : 0),
      0,
    );

  const used = parseFloat(
    (
      countQuantitative(user.silo) +
      countQuantitative(user.seeds) +
      countQuantitative(user.items)
    ).toFixed(1),
  );

  const limit = parseFloat(
    (INITIAL_LIMIT_FOR_SILO + SILO_LIMIT_INCREASE_BY_LEVEL * user.siloUpgrades).toFixed(1),
  );

  return { used, limit };
};

export { checkNeededItems, removeItems, addItems, getSiloLimits };
