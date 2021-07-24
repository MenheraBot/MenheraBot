import { ferreiro } from '../structures/Rpgs/items.json';
import { IInventoryUser, IUserRpgSchema } from './Types';

export default class RPGUtil {
  static countItems(items: IInventoryUser[]): Array<IInventoryUser & { amount: number }> {
    return items.reduce((p, v) => {
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
          job_id: v.job_id || 0,
        },
      ];
    }, []);
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
      capacity: backpack.capacity,
      value: userRpgData.loots.length + userRpgData.inventory.length,
    };
  }

  static addItemInInventory(user: IUserRpgSchema, item: IInventoryUser, amount = 1): void {
    user.inventory.push(...new Array(amount).fill(item));
  }

  static removeItemInLoots(
    user: IUserRpgSchema,
    itemName: string,
    amount: number | unknown = 1,
  ): void {
    for (let i = 0; i < amount; i++) {
      user.loots.splice(
        user.loots.findIndex((loot) => loot.name === itemName),
        1,
      );
    }
  }
}
