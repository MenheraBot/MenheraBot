export const EMOJIS = {
  success: '<:positivo:1289839144788561941>',
  error: '<:negacao:1289839348782596167>',
  warn: '<:atencao:1289839447902261320>',
  notify: '<:notificacao:1289839570325606410>',
  sorry: '<:menherasad:1289839716614541333>',
  wink: '<:menherawink:1289839828829077544>',
  ok: '<:menheraok:1289839964628193311>',
  loading: '<a:loading:1289840076154601554>',
  smile: '<:menherasmile:1289840169868070913>',
  devil: '<:menheradevil:1289840263887327232>',
  demons: '<:demon:1289840388890296362>',
  angels: '<:angel:1289840475028848724>',
  demigods: '<:demigod:1289840660358238260>',
  gods: '<:god:1289840738766557206>',
  robot: ':robot:',
  giants: '🦍',
  archangels: '👼',
  us: '🇺🇸',
  br: '🇧🇷',
  bug: '🐛',
  ring: '💍',
  yes: '✅',
  rock: ':rock:',
  paper: ':page_facing_up:',
  scissors: ':scissors:',
  gift: '🎁',
  calendar: '📅',
  no: '❌',
  map: '🗺️',
  question: '❓',
  yellow_circle: '🟡',
  heart: '❤️',
  roll: '🔑',
  lick: '👅',
  swap: '🔀',
  time: '⏲️',
  sword: '⚔️',
  gay_flag: '🏳️‍🌈',
  hourglass: '⌛',
  rainbow: '🌈',
  crown: '👑',
  scape: '🐥',
  lock: '🔒',
  list: '📜',
  cempasuchil: '🏵',
  estrelinhas: '⭐',
  lhama: '🦙',
  // EMOJIS DE FLUFFETYS
  pingus: '<:pingus:970443928241340466>',
  hamsin: '<:hamsin:970443928467828837>',
  chikys: '<:chikys:970443927402475550>',
  // EMOJIS DE BADHES
  badge_1: '<:badge_1:1289840980781957143>',
  badge_2: '<:badge_2:1289841053394010163>',
  badge_3: '<:badge_3:1289841199066251335>',
  badge_4: '<:badge_4:1289841296596537344>',
  badge_5: '<:badge_5:1289841376954941440>',
  badge_6: '<:badge_6:1289841491950305330>',
  badge_7: '<:badge_7:1289841581880512576>',
  badge_8: '<:badge_8:1289841653145927690>',
  badge_10: '<:badge_10:1289841741364723722>',
  badge_11: '<:badge_11:1289841817717833751>',
  badge_12: '<:badge_12:1289841895224377344>',
  badge_13: '<:badge_13:1289842047523491921>',
  badge_14: '<:badge_14:1289842130919096380>',
  badge_15: '<:badge_15:1289842247394922568>',
  badge_16: '<:badge_16:1289842360955703368>',
  badge_17: '<:badge_17:1289842467193225267>',
  badge_18: '<:badge_18:1289842565461446688>',
  badge_20: '<:badge_20:1289842649452249150>',
  badge_23: '<:badge_23:1289842732684279870>',
  badge_24: '<:badge_24:1289842813743272030>',
  badge_25: '<:badge_25:1289842909352562749>',
  badge_26: '<:badge_26:1289842975035228233>',
  badge_27: '<:badge_27:1289843058367533126>',

  badge_100: '<:badge_100:1289843158892412988>',
  badge_101: '<:badge_101:1289843233681178687>',
  badge_102: '<:badge_102:1289843298705477714>',
  badge_103: '<:badge_103:1289843359581605928>',
  badge_104: '<:badge_104:1289843457745227786>',
  badge_105: '<:badge_105:1289843540523880499>',
  badge_106: '<:badge_106:1289843639106801708>',

  badge_200: '<:badge_200:1289843746921250871>',
  badge_201: '<:badge_201:1289843977280946278>',
  badge_202: '<:badge_202:1289844044192808981>',
  badge_203: '<:badge_203:1289844107996430356>',
};

export const TOP_EMOJIS: { [key: string]: string } = {
  mamou: EMOJIS.crown,
  mamado: EMOJIS.lick,
  estrelinhas: EMOJIS.estrelinhas,
  demons: EMOJIS.demons,
  giants: EMOJIS.giants,
  completedDailies: EMOJIS.calendar,
  angels: EMOJIS.angels,
  archangels: EMOJIS.archangels,
  demigods: EMOJIS.demigods,
  gods: EMOJIS.gods,
  votes: EMOJIS.ok,
  rolls: EMOJIS.roll,
  blackjack: '🃏',
  coinflip: '📀',
  roulette: '🎡',
  bicho: '🦌',
};

export const COLORS = {
  Default: 0xa788ff,
  HuntDefault: 0xdf93fd,
  HuntDemons: 0xdf1b1b,
  HuntAngels: 0xefe9e9,
  HuntDemigods: 0x3cb5f0,
  HuntGods: 0xb115bf,
  HuntGiants: 0xfa611f,
  HuntArchangels: 0xa2f29e,
  Aqua: 0x03f3ff,
  Purple: 0x7f28c4,
  ACTIONS: 0xfa8cc5,
  Colorless: 0x36393f,
  Pinkie: 0xeab3fa,
  Pear: 0x74bd63,
  UltraPink: 0xff29ae,
  Battle: 0xe3beff,
  Random: (): number => Math.floor(Math.random() * 0xffffff),
};

export const TODAYS_YEAR = new Date().getFullYear();

export const transactionableCommandOption = [
  {
    name: '⭐ | Estrelinhas',
    nameLocalizations: { 'en-US': '⭐ | Stars' },
    value: 'estrelinhas' as const,
  },
  {
    name: '😈 | Demônios',
    nameLocalizations: { 'en-US': '😈 | Demons' },
    value: 'demons' as const,
  },
  {
    name: '👊 | Gigantes',
    nameLocalizations: { 'en-US': '👊 | Giants' },
    value: 'giants' as const,
  },
  {
    name: '👼 | Anjos',
    nameLocalizations: { 'en-US': '👼 | Angels' },
    value: 'angels' as const,
  },
  {
    name: '🧚‍♂️ | Arcanjos',
    nameLocalizations: { 'en-US': '🧚‍♂️ | Archangels' },
    value: 'archangels' as const,
  },
  {
    name: '🙌 | Semideuses',
    nameLocalizations: { 'en-US': '🙌 | Demigods' },
    value: 'demigods' as const,
  },
  {
    name: '✝️ | Deuses',
    nameLocalizations: { 'en-US': '✝️ | Gods' },
    value: 'gods' as const,
  },
];
