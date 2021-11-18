/* eslint-disable no-restricted-syntax */
import { defaultHuntCooldown, defaultHuntingProbabilities } from '@structures/Constants';
import {
  HuntingTypes,
  HuntProbabiltyProps,
  IHuntCooldownBoostItem,
  IMagicItem,
  IHuntProbablyBoostItem,
  IReturnData,
} from './Types';
import { getMagicItemByCustomFilter, getMagicItemById } from './Util';

export const calculateProbability = (probabilities: HuntProbabiltyProps[]): number => {
  const chance = Math.floor(Math.random() * 100);

  let accumulator = probabilities.reduce((p, c) => p + c.probabilty, 0);

  const mapedChanges: { amount: number; probabilities: number[] }[] = probabilities.map((a) => {
    const toReturn = [accumulator - a.probabilty, accumulator];
    accumulator -= a.probabilty;
    return { amount: a.amount, probabilities: toReturn };
  });

  for (const data of mapedChanges) {
    const [min, max] = data.probabilities;
    if (chance >= min && chance <= max) {
      return data.amount;
    }
  }
  return 0;
};

export const getUserHuntProbability = (
  userInventory: IMagicItem[],
  huntType: HuntingTypes,
): HuntProbabiltyProps[] => {
  const findedItem = userInventory
    .map((a) => getMagicItemById(a.id))
    .find((a) => a.data.type === 'HUNT_PROBABILITY_BOOST' && a.data.huntType === huntType);

  if (findedItem) return (findedItem.data as IHuntProbablyBoostItem).probabilities;

  return defaultHuntingProbabilities[huntType];
};

export const getUserHuntCooldown = (
  userInventory: IMagicItem[],
  huntType: HuntingTypes,
): number => {
  const findedItem = userInventory
    .map((a) => getMagicItemById(a.id))
    .find((a) => a.data.type === 'HUNT_COOLDOWN_REDUCTION' && a.data.huntType === huntType);

  if (findedItem) return (findedItem.data as IHuntCooldownBoostItem).huntCooldown;

  return defaultHuntCooldown;
};

export const dropItem = (
  userInventory: IMagicItem[],
  inUseItems: IMagicItem[],
  huntType: HuntingTypes,
): number | null => {
  const didDrop = Math.random() * 100;

  const itemToDrop = getMagicItemByCustomFilter(
    (a) => a[1].type === 'HUNT_COOLDOWN_REDUCTION' && a[1].huntType === huntType,
  ) as IReturnData<IHuntCooldownBoostItem>;

  if (!itemToDrop) return null;

  if (
    userInventory.some((a) => a.id === itemToDrop.id) ||
    inUseItems.some((a) => a.id === itemToDrop.id)
  )
    return null;

  if (didDrop <= itemToDrop.data.dropChance) return itemToDrop.id;
  return null;
};
