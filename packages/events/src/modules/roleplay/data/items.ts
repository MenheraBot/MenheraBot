/* eslint-disable no-bitwise */

enum ItemType {
  Drop,
  Armor,
}

interface BaseItem {
  type: ItemType;
}

export interface DropItem extends BaseItem {
  type: ItemType.Drop;
  sellValue: number;
  sellMinAmount?: number;
}

interface ArmorItem extends BaseItem {
  type: ItemType.Armor;
  armor: number;
  buyValue: number;
}

type AvailableItems = DropItem | ArmorItem;

export const Items = {
  1: {
    type: ItemType.Drop,
    sellValue: 1,
    sellMinAmount: 3,
  },
  2: {
    type: ItemType.Armor,
    armor: 4,
    buyValue: 5,
  },
};

export type InventoryItemID = keyof typeof Items;

export const getItem = <T extends AvailableItems>(itemId: number | string): T =>
  Items[itemId as '1'] as T;
