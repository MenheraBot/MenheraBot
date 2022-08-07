import { IBadge, T8BallAnswerTypes } from '@custom_types/Menhera';

export const shopEconomy = {
  colors: {
    purple: 30_000,
    red: 40_000,
    cian: 50_000,
    green: 60_000,
    pink: 70_000,
    yellow: 70_000,
    your_choice: 85_000,
  },
  hunts: {
    roll: 15_000,
    demons: 900,
    giants: 1_200,
    angels: 2_300,
    archangels: 3_100,
    demigods: 5_800,
    gods: 14_000,
  },
};

export const defaultHuntingProbabilities = {
  demons: [
    { amount: 0, probability: 25 },
    { amount: 1, probability: 21 },
    { amount: 2, probability: 18 },
    { amount: 4, probability: 15 },
    { amount: 3, probability: 12 },
    { amount: 5, probability: 9 },
  ],
  giants: [
    { amount: 0, probability: 33 },
    { amount: 1, probability: 23 },
    { amount: 2, probability: 19 },
    { amount: 4, probability: 18 },
    { amount: 3, probability: 7 },
  ],
  angels: [
    { amount: 0, probability: 50 },
    { amount: 1, probability: 30 },
    { amount: 2, probability: 15 },
    { amount: 3, probability: 5 },
  ],
  archangels: [
    { amount: 0, probability: 54 },
    { amount: 1, probability: 27 },
    { amount: 2, probability: 15 },
    { amount: 3, probability: 4 },
  ],
  demigods: [
    { amount: 0, probability: 70 },
    { amount: 1, probability: 27 },
    { amount: 2, probability: 3 },
  ],
  gods: [
    { amount: 0, probability: 92 },
    { amount: 1, probability: 8 },
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
  time: '⏲️',
  sword: '⚔️',
  gay_flag: '🏳️‍🌈',
  hourglass: '⌛',
  rainbow: '🌈',
  crown: '👑',
  scape: '🐥',
  lock: '🔒',
  list: '📜',
  estrelinhas: '⭐',
  lhama: '🦙',
  // EMOJIS DE FLUFFETYS
  pingus: '<:pingus:970443928241340466>',
  hamsin: '<:hamsin:970443928467828837>',
  chikys: '<:chikys:970443927402475550>',
  // EMOJIS DE BADHES
  badge_1: '<:badge_1:960660998002462730>',
  badge_2: '<:badge_2:960660997914394654>',
  badge_3: '<:badge_3:960660998015037460>',
  badge_4: '<:badge_4:960660998400921600>',
  badge_5: '<:badge_5:960660998098944020>',
  badge_6: '<:badge_6:960660998912630784>',
  badge_7: '<:badge_7:960660999386566747>',
  badge_8: '<:badge_8:960661002968518656>',
  badge_9: '<:badge_9:960660998350602310>',
  badge_10: '<:badge_10:960661746048204810>',
  badge_11: '<:badge_11:960661745599414282>',
  badge_12: '<:badge_12:960660998849712178>',
  badge_13: '<:badge_13:960661002360336384>',
  badge_15: '<:badge_15:960661000284151858>',
  badge_16: '<:badge_16:960661002570055750>',
  badge_17: '<:badge_17:990267891079327774>',
  badge_18: '<:badge_18:990267971731615794>',
  // EMOJIS DO RPG
  blood: '🩸',
  mana: '💧',
  armor: '🛡️',
  damage: '🗡️',
  level: '⚜️',
  experience: '🔰',
  chest: '<:Chest:760957557538947133>',
  intelligence: '🧠',
  church: '⛪',
  coin: '<:gold:960654694244573204>',
  blacksmith: '⚒️',
  agility: '👢',
  buff: '<:buff:964812397888016394>',
  debuff: '<:debuff:964812397825110026>',
  poison: '🧪',
  heal: '💊',
};

export type EmojiTypes = keyof typeof emojis;

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
  Battle: '#e3beff' as const,
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

export const TODAYS_YEAR = new Date().getFullYear();

export const HOURLY_ROULETTE_HIGH_VALUE_BET_LIMIT = 5;

export const DiscordFlagsToMenheraBadges: { [badge: string]: IBadge['id'] } = {
  EARLY_VERIFIED_BOT_DEVELOPER: 5,
  HOUSE_BALANCE: 2,
  HOUSE_BRILLIANCE: 3,
  HOUSE_BRAVERY: 4,
};

export const BLACKJACK_PRIZE_MULTIPLIERS = {
  init_blackjack: 1.5,
  blackjack: 1,
  base: 1,
};
