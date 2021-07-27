import { ferreiro } from '../structures/Rpgs/items.json';
import { IInventoryUser, IUserRpgSchema } from './Types';

type ResultItem = IInventoryUser & { amount: number };
export default class RPGUtil {
  static countItems(items: IInventoryUser[]): Array<ResultItem> {
    const result = items.reduce((acc, cur) => {
      const item = acc.get(cur.name);

      if (item) {
        item.amount += 1;
      } else {
        acc.set(cur.name, {
          ...cur,
          amount: 1,
        });
      }

      return acc;
    }, new Map<string, ResultItem>());

    return [...result.values()];
  }

  static getBackpack(userRpgData: IUserRpgSchema): {
    name: string;
    capacity: number;
    value: number;
  } {
    const backpackId = userRpgData?.backpack.name;
    if (!backpackId) {
      throw new Error(`${userRpgData._id} doesn't has a backpack.`);
    }

    const backpack = ferreiro.find(
      (item) => item.category === 'backpack' && item.id === backpackId,
    );
    if (!backpack) {
      throw new Error(`${userRpgData._id} has a fake backpack. (${backpackId})`);
    }

    return {
      name: backpack.id,
      capacity: backpack?.capacity ?? 0,
      value: userRpgData.loots.length + userRpgData.inventory.length,
    };
  }

  static addItemInInventory(user: IUserRpgSchema, item: IInventoryUser, amount = 1): void {
    user.inventory.push(...new Array(amount).fill(item));
  }

  static removeItemInLoots(user: IUserRpgSchema, itemName: string, amount: number = 1): void {
    for (let i = 0; i < amount; i++) {
      user.loots.splice(
        user.loots.findIndex((loot) => loot.name === itemName),
        1,
      );
    }
  }
}
