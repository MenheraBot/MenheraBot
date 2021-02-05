const { ferreiro } = require('../structures/Rpgs/items.json');

class RPGUtil {
  static countItems(items) {
    return items.reduce((p, v) => {
      const exists = p.findIndex((x) => x.name === v.name);
      if (exists !== -1) {
        p[exists].amount++;
        return p;
      }
      return [...p, {
        name: v.name, amount: 1, value: v.value, job_id: v.job_id || 0,
      }];
    }, []);
  }

  static getBackpack(userRpgData) {
    const backpackId = userRpgData?.backpack.name;
    if (!backpackId) {
      throw new Error(`${userRpgData.id} not has a backpack.`);
    }

    const backpack = ferreiro.find((item) => item.category === 'backpack' && item.id === backpackId);
    if (!backpack) {
      throw new Error(`${userRpgData.id} has a fake backpack. (${backpackId})`);
    }

    return {
      name: backpack.id,
      capacity: backpack.capacity,
      value: userRpgData.loots.length + userRpgData.inventory.length,
    };
  }

  static addItemInInventory(user, item, amount = 1) {
    user.inventory.push(...(new Array(amount).fill(item)));
  }

  static removeItemInLoots(user, itemName, amount = 1) {
    for (let i = 0; i < amount; i++) {
      user.loots.splice(user.loots.findIndex((loot) => loot.name === itemName), 1);
    }
  }
}

module.exports = RPGUtil;
