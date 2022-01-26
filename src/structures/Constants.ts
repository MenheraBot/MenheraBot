import { T8BallAnswerTypes } from '@utils/Types';

export const shopEconomy = {
  colors: {
    purple: 30_000,
    red: 40_000,
    cian: 50_000,
    green: 60_000,
    pink: 70_000,
    yellow: 80_000,
    your_choice: 100_000,
  },
  hunts: {
    roll: 15_000,
    demons: 1_200,
    giants: 1_500,
    angels: 2_600,
    archangels: 3_200,
    demigods: 6_000,
    gods: 16_000,
  },
};

export const defaultHuntingProbabilities = {
  demons: [
    { amount: 0, probabilty: 25 },
    { amount: 1, probabilty: 21 },
    { amount: 2, probabilty: 18 },
    { amount: 4, probabilty: 15 },
    { amount: 3, probabilty: 12 },
    { amount: 5, probabilty: 9 },
  ],
  giants: [
    { amount: 0, probabilty: 33 },
    { amount: 1, probabilty: 23 },
    { amount: 2, probabilty: 19 },
    { amount: 4, probabilty: 18 },
    { amount: 3, probabilty: 7 },
  ],
  angels: [
    { amount: 0, probabilty: 50 },
    { amount: 1, probabilty: 30 },
    { amount: 2, probabilty: 15 },
    { amount: 3, probabilty: 5 },
  ],
  archangels: [
    { amount: 0, probabilty: 54 },
    { amount: 1, probabilty: 27 },
    { amount: 2, probabilty: 15 },
    { amount: 3, probabilty: 4 },
  ],
  demigods: [
    { amount: 0, probabilty: 70 },
    { amount: 1, probabilty: 27 },
    { amount: 2, probabilty: 3 },
  ],
  gods: [
    { amount: 0, probabilty: 92 },
    { amount: 1, probabilty: 8 },
  ],
};

export const defaultHuntCooldown = 3_600_000;

export const votes = {
  rollQuantity: 1,
  maxStarValue: 3_600,
  minStarValue: 1_200,
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
  ok: '<:ok:727975974125436959>',
  devil: '<:MenheraDevil:768621225420652595>',
  demons: '<:Demon:758765044443381780>',
  angels: '<:Angel:758765044204437535>',
  demigods: '<:SemiGod:758766732235374674>',
  gods: '<:God:758474639570894899>',
  giants: '🦍',
  archangels: '👼',
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
  gay_flag: '🏳️‍🌈',
  rainbow: '🌈',
  crown: '👑',
  scape: '🐥',
  lock: '🔒',
  list: '📜',
  estrelinhas: '⭐',
  // EMOJIS DO RPG
  blood: '🩸',
  mana: '💧',
  stamina: '⚡',
  sanity: '🎭',
  level: '⚜️',
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

export const ROLEPLAY_CONSTANTS = {
  bossCooldown: 3600000,
  dungeonCooldown: 3600000,
  scapeCooldown: 7200000,
  deathCooldown: 43200000,
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
  Default: '#a788ff' as const,
  HuntDefault: '#df93fd' as const,
  HuntDemons: '#df1b1b' as const,
  HuntAngels: '#efe9e9' as const,
  HuntDemigods: '#3cb5f0' as const,
  HuntGods: '#b115bf' as const,
  HuntGiants: '#fa611f' as const,
  HuntArchangels: '#a2f29e' as const,
  Aqua: '#03f3ff' as const,
  Purple: '#7f28c4' as const,
  ACTIONS: '#fa8cc5' as const,
  Colorless: '#36393F' as const,
  Pinkie: '#eab3fa' as const,
  Pear: '#74bd63' as const,
  UltraPink: '#ff29ae' as const,
};

interface RouletteNumber {
  value: number;
  color: 'red' | 'black';
  parity: 'odd' | 'even';
  size: 'high' | 'low';
  dozen: 'first' | 'second' | 'third';
}

export const ROULETTE_NUMBERS: Array<RouletteNumber | { value: 0; color: 'green'; dozen: '?' }> = [
  { value: 0, color: 'green', dozen: '?' },
  { value: 1, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 2, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 3, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 4, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 5, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 6, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 7, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 8, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 9, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 10, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 11, color: 'black', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 12, color: 'red', parity: 'even', size: 'low', dozen: 'first' },
  { value: 13, color: 'black', parity: 'odd', size: 'low', dozen: 'second' },
  { value: 14, color: 'red', parity: 'even', size: 'low', dozen: 'second' },
  { value: 15, color: 'black', parity: 'odd', size: 'low', dozen: 'second' },
  { value: 16, color: 'red', parity: 'even', size: 'low', dozen: 'second' },
  { value: 17, color: 'black', parity: 'odd', size: 'low', dozen: 'second' },
  { value: 18, color: 'red', parity: 'even', size: 'low', dozen: 'second' },
  { value: 19, color: 'red', parity: 'odd', size: 'high', dozen: 'second' },
  { value: 20, color: 'black', parity: 'even', size: 'high', dozen: 'second' },
  { value: 21, color: 'red', parity: 'odd', size: 'high', dozen: 'second' },
  { value: 22, color: 'black', parity: 'even', size: 'high', dozen: 'second' },
  { value: 23, color: 'red', parity: 'odd', size: 'high', dozen: 'second' },
  { value: 24, color: 'black', parity: 'even', size: 'high', dozen: 'second' },
  { value: 25, color: 'red', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 26, color: 'black', parity: 'even', size: 'high', dozen: 'third' },
  { value: 27, color: 'red', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 28, color: 'black', parity: 'even', size: 'high', dozen: 'third' },
  { value: 29, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 30, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
  { value: 31, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 32, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
  { value: 33, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 34, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
  { value: 35, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 36, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
];

export const JOGO_DO_BICHO = [
  'avestruz',
  'ágia',
  'burro',
  'borboleta',
  'cachorro',
  'cabra',
  'carneiro',
  'camelo',
  'cobra',
  'coelho',
  'cavalo',
  'elefante',
  'galo',
  'gato',
  'jacaré',
  'leão',
  'macaco',
  'porco',
  'pavão',
  'peru',
  'touro',
  'tigre',
  'urso',
  'veado',
  'vaca',
];

export const BICHO_BET_MULTIPLIER = {
  unity: 2,
  ten: 5,
  hundred: 20,
  thousand: 500,
  animal: 3,
  sequence: 19,
  corner: 1000,
};

export const BLACKJACK_CARDS = Array.from({ length: 52 }, (_, i) => i + 1);

export const CANNOT_BUY_THEMES = [3, 5, 4, 6];
