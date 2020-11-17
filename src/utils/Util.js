class Util {
  static countItems(items) {
    return items.reduce((p, v) => {
      const exists = p.findIndex((x) => x.name === v.name);
      if (exists !== -1) {
        p[exists].amount++;
        p[exists].value += v.value;
        return p;
      }
      return [...p, { name: v.name, amount: 1, value: v.value }];
    }, []);
  }

  static updateBackpack(user, newValueFn = user.backpack.value) {
    user.backpack = {
      name: user.backpack.name,
      capacity: user.backpack.capacity,
      value: newValueFn(user.backpack.value),
    };

    if (user.backpack?.value < 0) {
      user.backpack = { name: user.backpack.name, capacity: user.backpack.capacity, value: 0 };
    }
  }

  static addItemInLoots(user, itemName, amount = 1) {
    user.inventory.push(...(new Array(amount).fill(itemName)));
    Util.updateBackpack(user, (v) => v + amount);
  }

  static removeItemInLoots(user, itemName, amount = 1) {
    for (let i = 0; i < amount; i++) {
      user.loots.splice(user.loots.findIndex((loot) => loot.name === itemName), 1);
    }

    Util.updateBackpack(user, (currentValue) => currentValue - amount);
  }
}

module.exports = Util;
