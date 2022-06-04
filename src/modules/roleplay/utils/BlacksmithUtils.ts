import { IReturnData } from '@custom_types/Menhera';
import { EquipmentItem, EquipmentTypes, InventoryItem, RoleplayUserSchema } from '@roleplay/Types';
import { getItemsByType } from './DataUtils';

export const packDrops = (drops: number[]): InventoryItem[] =>
  drops.reduce<InventoryItem[]>((acc, itemId) => {
    const item = acc.find((a) => a.id === itemId);

    if (!item) {
      acc.push({ id: itemId, level: 1, amount: 1 });
      return acc;
    }

    item.amount += 1;
    return acc;
  }, []);

export const userHasAllDrops = (
  inventory: RoleplayUserSchema['inventory'],
  drops: InventoryItem[],
): boolean =>
  drops.every((item) =>
    inventory.some(
      (itemInInventory) => itemInInventory.id === item.id && itemInInventory.amount >= item.amount,
    ),
  );

// TODO: Create locations
export const getAllForgeableItems = (
  forgeType: EquipmentTypes,
  locationId = 0,
): IReturnData<EquipmentItem>[] => {
  const items = getItemsByType<EquipmentItem>(forgeType);

  return items.filter(
    (item) =>
      item.data.availableLocations.includes(locationId) &&
      item.data.levels[1].cost !== 0 &&
      item.data.levels[1].items.length !== 0,
  );
};
