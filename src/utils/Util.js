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
}

module.exports = Util;
