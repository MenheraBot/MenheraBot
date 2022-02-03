import { ConsumableItem, LeveledItem } from '@roleplay/Types';
import { getItemsByFlags } from './DataUtils';

export const a = 'a';

export const availableToBuyItems = (userLevel: number): Array<LeveledItem> => {
  const potions = getItemsByFlags<ConsumableItem>(['buyable', 'consumable']);

  const potionLevel = userLevel / 4 + 1;

  return potions.map((item) => ({
    id: item.id,
    level: potionLevel,
  }));
};
