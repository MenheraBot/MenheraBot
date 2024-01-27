/* eslint-disable no-bitwise */

enum ItemType {
  Drop,
  Armor,
}

interface BaseItem {
  type: ItemType;
  $devName: string;
}

interface DropItem extends BaseItem {
  type: ItemType.Drop;
  sellValue: number;
  sellMinGroup?: number;
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
    sellMinGroup: 3,
  },
  2: {
    type: ItemType.Armor,
    $devName: 'Cota de malha',
    armor: 4,
    buyValue: 5,
  },
};
