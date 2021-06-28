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
    demigod: 8900,
    god: 25000,
  },
};

const probabilities = {
  support: {
    demon: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 5, 6],
    angel: [0, 0, 0, 1, 1, 1, 2, 3],
    demigod: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
    god: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  },
  normal: {
    demon: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 5],
    angel: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3],
    demigod: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    god: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
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

const emojis = {
  success: '<:positivo:759603958485614652>',
  error: '<:negacao:759603958317711371>',
  warn: '<:atencao:759603958418767922>',
  notify: '<:notify:759607330597502976>',
  wink: '<:MenheraWink:767210250637279252>',
  level: '<a:LevelUp:760954035779272755>',
  yes: '✅',
  no: '❌',
  map: '🗺️',
  question: '❓',
  yellow_circle: '🟡',
  heart: '❤️',
  sword: '⚔️',
  scape: '🐥',
  lock: '🔒',
};

const COLORS = {
  HuntDefault: '#df93fd',
  HuntDemon: '#df1b1b',
  HuntAngel: '#efe9e9',
  HuntSD: '#3cb5f0',
  HuntGod: '#df93fd',
};

const BLACKJACK_CARDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];

Object.freeze(BLACKJACK_CARDS);

module.exports = {
  shopEconomy, probabilities, rpg, votes, emojis, COLORS, BLACKJACK_CARDS,
};
