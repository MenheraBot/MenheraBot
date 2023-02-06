import { defaultHuntCooldown, defaultHuntingProbabilities } from './defaultValues';
import {
  DatabaseHuntingTypes,
  HuntCooldownBoostItem,
  HuntMagicItem,
  HuntProbabiltyProps,
  HuntProbablyBoostItem,
  MagicItemsFile,
  StaticItemData,
} from './types';
import { HuntMagicItems } from './magicItems';

const getMagicItemById = (itemId: number): StaticItemData<MagicItemsFile> => {
  const item = HuntMagicItems[itemId];

  if (!item) throw new Error(`MagicItem with id ${itemId} don't exists`);

  return {
    id: itemId,
    data: item,
  };
};

const getUserHuntProbability = (
  userInventory: HuntMagicItem[],
  huntType: DatabaseHuntingTypes,
): HuntProbabiltyProps[] => {
  const foundedItem = userInventory
    .map((a) => getMagicItemById(a.id))
    .find((a) => a.data.type === 'HUNT_PROBABILITY_BOOST' && a.data.huntType === huntType);

  if (foundedItem) return (foundedItem.data as HuntProbablyBoostItem).probabilities;

  return defaultHuntingProbabilities[huntType];
};

const getUserHuntCooldown = (
  userInventory: HuntMagicItem[],
  huntType: DatabaseHuntingTypes,
): number => {
  const foundedItem = userInventory
    .map((a) => getMagicItemById(a.id))
    .find((a) => a.data.type === 'HUNT_COOLDOWN_REDUCTION' && a.data.huntType === huntType);

  if (foundedItem) return (foundedItem.data as HuntCooldownBoostItem).huntCooldown;

  return defaultHuntCooldown;
};

const calculateProbability = (probabilities: HuntProbabiltyProps[]): number => {
  const chance = Math.floor(Math.random() * 100);

  let accumulator = 100;

  // eslint-disable-next-line no-restricted-syntax
  for (const data of probabilities) {
    accumulator -= data.probability;
    if (chance >= accumulator) {
      return data.amount;
    }
  }
  return 0;
};

const getHuntCooldownReductionItem = (
  huntType: DatabaseHuntingTypes,
): null | StaticItemData<HuntCooldownBoostItem> =>
  Object.entries(HuntMagicItems)
    .filter((item) => item[1].type === 'HUNT_COOLDOWN_REDUCTION' && item[1].huntType === huntType)
    .map((a) => ({ id: Number(a[0]), data: a[1] as HuntCooldownBoostItem }))[0];

const dropHuntItem = (
  userInventory: HuntMagicItem[],
  inUseItems: HuntMagicItem[],
  huntType: DatabaseHuntingTypes,
): null | number => {
  const didDrop = Math.random() * 100;

  const itemToDrop = getHuntCooldownReductionItem(huntType);

  if (!itemToDrop) return null;

  if (
    userInventory.some((a) => a.id === itemToDrop.id) ||
    inUseItems.some((a) => a.id === itemToDrop.id)
  )
    return null;

  if (didDrop <= itemToDrop.data.dropChance) return itemToDrop.id;
  return null;
};

export {
  getUserHuntProbability,
  getUserHuntCooldown,
  calculateProbability,
  dropHuntItem,
  getMagicItemById,
};
