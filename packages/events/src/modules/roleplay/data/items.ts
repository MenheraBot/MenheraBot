/* eslint-disable no-bitwise */

enum ItemType {
  Drop,
  Armor,
}

interface BaseItem {
  type: ItemType;
  $devName: string;
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

export const Items: Record<number, AvailableItems> = {
  1: {
    type: ItemType.Drop,
    $devName: 'Pele de goblin',
    sellValue: 1,
    sellMinAmount: 3,
  },
  2: {
    type: ItemType.Armor,
    $devName: 'Cota de malha',
    armor: 4,
    buyValue: 5,
  },
};

export const getItem = <T extends AvailableItems>(itemId: number | string): T =>
  Items[itemId as '1'] as T;
