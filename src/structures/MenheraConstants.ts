import { ColorResolvable } from 'discord.js';

export const shopEconomy = {
  colors: {
    purple: 50000,
    red: 100000,
    cian: 150000,
    green: 300000,
    pink: 500000,
    yellow: 400000,
    your_choice: 700000,
  },
  hunts: {
    roll: 7000,
    demon: 600,
    giant: 1900,
    angel: 3200,
    arcangel: 5900,
    demigod: 8000,
    god: 19000,
  },
};

export const probabilities = {
  support: {
    demon: [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 5, 6,
    ],
    giant: [0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 5],
    angel: [0, 0, 0, 1, 1, 1, 2, 3],
    arcangel: [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    demigod: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
    god: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  },
  normal: {
    demon: [
      0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 4, 5,
    ],
    giant: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 4],
    angel: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3],
    arcangel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
    demigod: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    god: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  },
  defaultTime: 3600000,
};

export const votes = {
  rollQuantity: 1,
  maxStarValue: 3600,
  minStarValue: 1200,
  rollWeekendMultiplier: 2,
  starWeekendMultiplier: 2,
  roll20Multiplier: 4,
  star20Multiplier: 4,
};

export const emojis = {
  success: '<:positivo:759603958485614652>',
  error: '<:negacao:759603958317711371>',
  warn: '<:atencao:759603958418767922>',
  notify: '<:notify:759607330597502976>',
  wink: '<:MenheraWink:767210250637279252>',
  ring: '💍',
  yes: '✅',
  no: '❌',
  map: '🗺️',
  question: '❓',
  yellow_circle: '🟡',
  heart: '❤️',
  sword: '⚔️',
  rainbow: '🌈',
  giant: '🦍',
  archangel: '👼',
  scape: '🐥',
  lock: '🔒',
  star: '⭐',
  demon: '<:Demon:758765044443381780>',
  angel: '<:Angel:758765044204437535>',
  semigod: '<:SemiGod:758766732235374674>',
  god: '<:God:758474639570894899>',
  us: '🇺🇸',
  br: '🇧🇷',
  ligma: '<:MenheraDevil:768621225420652595>',
};

export type EmojiTypes = keyof typeof emojis;

export const COLORS = {
  HuntDefault: '#df93fd' as ColorResolvable,
  HuntDemon: '#df1b1b' as ColorResolvable,
  HuntAngel: '#efe9e9' as ColorResolvable,
  HuntSD: '#3cb5f0' as ColorResolvable,
  HuntGod: '#b115bf' as ColorResolvable,
  HuntGiant: '#fa611f' as ColorResolvable,
  HuntArchangel: '#a2f29e' as ColorResolvable,
  Aqua: '#03f3ff' as ColorResolvable,
  Purple: '#7f28c4' as ColorResolvable,
  ACTIONS: '#fa8cc5' as ColorResolvable,
};

export const BLACKJACK_CARDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
  52,
];

Object.freeze(BLACKJACK_CARDS);
Object.freeze(COLORS);
Object.freeze(emojis);
Object.freeze(shopEconomy);
Object.freeze(probabilities);
Object.freeze(votes);
