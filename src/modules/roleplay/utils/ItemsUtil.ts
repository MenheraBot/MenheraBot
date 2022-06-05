import { LeveledItem } from '@roleplay/Types';
import { getItemsByType } from './DataUtils';

export const isItemEquipment = (itemId: number): boolean =>
  [100, 101, 102].includes(itemId) || itemId >= 1000;

export const availableToBuyItems = (userLevel: number): Array<LeveledItem> => {
  const potions = getItemsByType('potion');

  const potionLevel = Math.floor(userLevel / 4 + 1);

  return potions.map((item) => ({
    id: item.id,
    level: potionLevel,
  }));
};
