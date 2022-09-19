export const EMOJIS = {
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