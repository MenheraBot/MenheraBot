import { T8BallAnswerTypes } from '@utils/Types';

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
    archangel: 5900,
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
    archangel: [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
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
    archangel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
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
  devil: '<:MenheraDevil:768621225420652595>',
  demon: '<:Demon:758765044443381780>',
  angel: '<:Angel:758765044204437535>',
  semigod: '<:SemiGod:758766732235374674>',
  god: '<:God:758474639570894899>',
  ok: '<:ok:727975974125436959>',
  us: '🇺🇸',
  br: '🇧🇷',
  ring: '💍',
  yes: '✅',
  no: '❌',
  map: '🗺️',
  question: '❓',
  yellow_circle: '🟡',
  heart: '❤️',
  lick: '👅',
  sword: '⚔️',
  rainbow: '🌈',
  giant: '🦍',
  archangel: '👼',
  crown: '👑',
  scape: '🐥',
  lock: '🔒',
  list: '📜',
  star: '⭐',
};

export const languageByLocale = {
  brazil: 'pt-BR',
  europe: 'en-US',
  'eu-central': 'en-US',
  'eu-west': 'en-US',
  hongkong: 'en-US',
  japan: 'en-US',
  russia: 'en-US',
  singapore: 'en-US',
  southafrica: 'en-US',
  sydney: 'en-US',
  'us-central': 'en-US',
  'us-east': 'en-US',
  'us-south': 'en-US',
  'us-west': 'en-US',
};

export const EightBallAnswers: { id: number; type: T8BallAnswerTypes }[] = [
  {
    id: 0,
    type: 'positive',
  },
  {
    id: 1,
    type: 'positive',
  },
  {
    id: 2,
    type: 'positive',
  },
  {
    id: 3,
    type: 'positive',
  },
  {
    id: 4,
    type: 'positive',
  },
  {
    id: 5,
    type: 'positive',
  },
  {
    id: 6,
    type: 'positive',
  },
  {
    id: 7,
    type: 'positive',
  },
  {
    id: 8,
    type: 'positive',
  },
  {
    id: 9,
    type: 'positive',
  },
  {
    id: 10,
    type: 'negative',
  },
  {
    id: 11,
    type: 'negative',
  },
  {
    id: 12,
    type: 'negative',
  },
  {
    id: 13,
    type: 'negative',
  },
  {
    id: 14,
    type: 'negative',
  },
  {
    id: 15,
    type: 'neutral',
  },
  {
    id: 16,
    type: 'neutral',
  },
  {
    id: 17,
    type: 'neutral',
  },
  {
    id: 18,
    type: 'neutral',
  },
  {
    id: 19,
    type: 'neutral',
  },
];

export type EmojiTypes = keyof typeof emojis;

export const COLORS = {
  HuntDefault: '#df93fd' as const,
  HuntDemon: '#df1b1b' as const,
  HuntAngel: '#efe9e9' as const,
  HuntSD: '#3cb5f0' as const,
  HuntGod: '#b115bf' as const,
  HuntGiant: '#fa611f' as const,
  HuntArchangel: '#a2f29e' as const,
  Aqua: '#03f3ff' as const,
  Purple: '#7f28c4' as const,
  ACTIONS: '#fa8cc5' as const,
  Colorless: '#36393F' as const,
  Pinkie: '#eab3fa' as const,
  Pear: '#74bd63' as const,
  UltraPink: '#ff29ae' as const,
};

export const BLACKJACK_CARDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
  52,
];

export const clientUnreadyString =
  '🇧🇷 | A Menhera ainda não se conectou 100%! Aguarde um pouquinho antes de tentar novamente!\n🇺🇸 | Menhera is not yet 100% connected! Wait a while before trying again!';

export const commandsInGuild =
  '🇧🇷 | Você só pode usar comandos em servidores\n🇺🇸 | You can only uses commands in guilds';

Object.freeze(BLACKJACK_CARDS);
Object.freeze(COLORS);
Object.freeze(emojis);
Object.freeze(shopEconomy);
Object.freeze(probabilities);
Object.freeze(votes);
