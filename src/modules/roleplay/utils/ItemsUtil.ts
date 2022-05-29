import { LeveledItem } from '@roleplay/Types';
import { getItemsByType } from './DataUtils';

export const a = 'a';

export const availableToBuyItems = (userLevel: number): Array<LeveledItem> => {
  const potions = getItemsByType('potion');

  const potionLevel = Math.floor(userLevel / 4 + 1);

  return potions.map((item) => ({
    id: item.id,
    level: potionLevel,
  }));
};
