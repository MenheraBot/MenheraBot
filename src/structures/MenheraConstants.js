const shopEconomy = {
  colors: {
    purple: 50000,
    red: 100000,
    cian: 150000,
    green: 300000,
    pink: 500000,
    yellow: 400000,
    your_choice: 10000000,
  },
  hunts: {
    roll: 7000,
    demon: 700,
    angel: 3200,
    demigod: 100,
    god: 25000,
  },
};

const probabilities = {
  support: {
    demon: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4],
    angel: [0, 0, 0, 1, 1, 1, 1, 2],
    demigod: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    god: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  },
  normal: {
    demon: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4],
    angel: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    demigod: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    god: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  },
  defaultTime: 3600000,
};

const rpg = {
  bossCooldown: 3600000,
  dungeonCooldown: 3600000,
  scapeCooldown: 7200000,
  deathCooldown: 43200000,
};

const votes = {
  rollQuantity: 1,
  maxStarValue: 3600,
  minStarValue: 1200,
  rpgRollQuantity: 1,
  maxStoneValue: 980,
  minStoneValue: 100,
  rollWeekendMultiplier: 2,
  starWeekendMultiplier: 2,
  stoneWeekendMultiplier: 2,
  rpgRollWeekendMultiplier: 2,
  roll20Multiplier: 4,
  star20Multiplier: 4,
  rpgMoney20Multiplier: 4,
  rpgRoll20Multiplier: 4,
};

module.exports = {
  shopEconomy, probabilities, rpg, votes,
};
