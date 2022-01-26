import Handler from './Handler';
import { Backpack, InventoryItem, RoleplayUserSchema } from './Types';

interface CountedItems {
  name: string;
  amount: number;
  value: number;
}

export default class RPGUtil {
  static countItems(items: InventoryItem[]): CountedItems[] {
    return items.reduce<CountedItems[]>((p, v) => {
      const exists = p.findIndex((x) => x.name === v.name);
      if (exists !== -1) {
        p[exists].amount++;
        return p;
      }
      return [
        ...p,
        {
          name: v.name,
          amount: 1,
          value: v.value,
        },
      ];
    }, []);
  }

  static getBackpack(userRpgData: RoleplayUserSchema): Backpack & { value: number } {
    const backpackId = userRpgData?.backpack.name;

    const backpack = Handler.items.ferreiro.find(
      (item) => item.category === 'backpack' && item.id === backpackId,
    ) ?? { id: 'Mochila de Pele de Lobo', capacity: 15 };

    return {
      name: backpack.id,
      capacity: backpack.capacity ?? 15,
      value: userRpgData.loots.length + userRpgData.inventory.length,
    };
  }

  static addItemInInventory(user: RoleplayUserSchema, item: InventoryItem, amount = 1): void {
    user.inventory.push(...new Array(amount).fill(item));
  }

  static removeItemInLoots(user: RoleplayUserSchema, itemName: string, amount = 1): void {
    for (let i = 0; i < amount; i++) {
      user.loots.splice(
        user.loots.findIndex((loot) => loot.name === itemName),
        1,
      );
    }
  }
}
