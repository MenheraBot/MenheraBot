import { T8BallAnsweTypes } from '@utils/Types';

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
  home: '🏘️',
  pin: '📍',
  question: '❓',
  yellow_circle: '🟡',
  heart: '❤️',
  sword: '⚔️',
  trident: '🔱',
  double_hammer: '⚒️',
  blood: '🩸',
  mana: '💧',
  shield: '🛡️',
  xp: '✨',
  rainbow: '🌈',
  money: '💰',
  giant: '🦍',
  archangel: '👼',
  scape: '🐥',
  lock: '🔒',
  list: '📜',
  star: '⭐',
  demon: '<:Demon:758765044443381780>',
  angel: '<:Angel:758765044204437535>',
  semigod: '<:SemiGod:758766732235374674>',
  god: '<:God:758474639570894899>',
  us: '🇺🇸',
  br: '🇧🇷',
  ligma: '<:MenheraDevil:768621225420652595>',
  rpg: {
    Assassin: '<:assassin:877497643897585735>',
    Hunter: '<:hunter:877500109401784360>',
    Reaper: '<:reaper:877501630713561129>',
    Warrior: '<:warrior:877500315543404584>',
    Illusionist: '<:illusionist:877499942904680478>',
    Paladin: '<:paladin:877500563540037632>',
    elf: '<:elfo:877573220390301736>',
    goblin: '<:goblin:877573777024745552>',
    chained: '<:chained:877575893596389498>',
    saint: '<:saint:877576342965735464>',
    human: '<:human:877576375698083940>',
    orc: '<:orc:877576354059665408>',
  },
  roleplay_custom: {
    bronze: '<:bronze:878054145561604158>',
    silver: '<:silver:878054145834229861>',
    gold: '<:gold:878054145796472922>',
    tired: '<:tired:878080871477940224>',
    speed: '<:speed:878089794113110076>',
    attack_skill: '<:attack_skill:878087236812439612>',
    ability_skill: '<:ability_skill:878087221704536065>',
    lucky: '<:lucky:878088065644654613>',
    level: '<:level:878090363598942258>',
    fire: '<:fire:878320932807147552>',
    prisma: '<:prism:878320933318836224>',
    nature: '<:nature:878320933230751846>',
    light: '<:light:878320933457244170>',
    gravity: '<:gravity:878320932614185030>',
    darkness: '<:darkness:878320931741765694>',
    backpack: '<:backpack:880920927171383386>',
  },
};

export type RpgClassNames = keyof typeof emojis.rpg;
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

export const EightBallAnswers: { id: number; type: T8BallAnsweTypes }[] = [
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
  Pear: '#bdffc4' as const,
  ACTIONS: '#fa8cc5' as const,
  Colorless: '#36393F' as const,
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
