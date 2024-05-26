import { defaultHuntCooldown, defaultHuntingProbabilities } from './defaultValues';
import {
  DatabaseHuntingTypes,
  HuntCooldownBoostItem,
  HuntMagicItem,
  HuntProbablyBoostItem,
  MagicItemsFile,
  StaticItemData,
} from './types';
import { HuntMagicItems } from './magicItems';
import { ProbabilityAmount } from '../../types/menhera';

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
): ProbabilityAmount[] => {
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

export { getUserHuntProbability, getUserHuntCooldown, dropHuntItem, getMagicItemById };
