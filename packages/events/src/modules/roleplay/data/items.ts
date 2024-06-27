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
    sellMinAmount: 2,
  },
  2: {
    type: ItemType.Drop,
    sellValue: 6,
    sellMinAmount: 3,
  },
  3: {
    type: ItemType.Drop,
    sellValue: 2,
    sellMinAmount: 1,
  },
  4: {
    type: ItemType.Drop,
    sellValue: 3,
    sellMinAmount: 2,
  },
};

export type InventoryItemID = keyof typeof Items;

export const getItem = <T extends AvailableItems>(itemId: number | string): T =>
  Items[itemId as '1'] as T;
