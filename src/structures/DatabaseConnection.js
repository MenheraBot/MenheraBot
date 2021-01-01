const mongoose = require('mongoose');
const config = require('../../config.json');

mongoose.connect(config.uri, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,
}, (err) => {
  if (err) return console.log(`(x) Error to connecting to database \n${err}`);
  return console.log('[DATABASE] Conectado com sucesso à database');
});

const cmdSchema = mongoose.Schema({
  _id: { type: String },
  maintenance: { type: Boolean, default: false },
  maintenanceReason: { type: String, default: '' },
});

const familiaSchema = new mongoose.Schema({
  _id: { type: String },
  abilities: { type: Array },
  boost: { type: Object },
  members: { type: Array, default: [] },
  levelFamilia: { type: Number, default: 1 },
  bank: { type: String, default: '0' },
  nextLevel: { type: String, default: '15000' },
});

const guildSchema = mongoose.Schema({
  id: { type: String, unique: true },
  prefix: { type: String, default: config.prefix },
  blockedChannels: { type: Array, default: [] },
  lang: { type: String, default: 'pt-BR' },
});

const rememberSchema = mongoose.Schema({
  id: { type: String },
  rememberAt: { type: String },
  createdAt: { type: String },
  channelId: { type: String },
  serverId: { type: String },
  serverLang: { type: String },
  content: { type: String },
  rememberInPv: { type: Boolean },
});

const rpgSchema = mongoose.Schema({
  _id: { type: String },
  class: { type: String },
  life: { type: Number, default: 100 },
  armor: { type: Number, default: 0 },
  damage: { type: Number, default: 0 },
  mana: { type: Number, default: 0 },
  maxLife: { type: Number, default: 100 },
  maxMana: { type: Number, default: 20 },
  abilityPower: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  nextLevelXp: { type: Number, default: 10 },
  abilities: { type: Array, default: [] },
  abilitiesCooldown: { type: Array, default: [] },
  uniquePower: { type: Object },
  loots: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  money: { type: Number, default: 0 },
  dungeonCooldown: { type: String, default: '00000000' },
  death: { type: String, default: '00000000' },
  weapon: { type: Object },
  protection: { type: Object, default: { name: 'Armadura Padrão', armor: 1 } },
  hotelTime: { type: String, default: '00000000' },
  inBattle: { type: Boolean, default: false },
  hasFamily: { type: Boolean, default: false },
  familyName: { type: String, default: null },
  backpack: { type: Object, default: { name: 'Mochila de Pele de Lobo' } },
  resetRoll: { type: Number, default: 0 },
});

const userSchema = mongoose.Schema({
  id: { type: String, unique: true },
  mamadas: { type: Number, default: 0 },
  mamou: { type: Number, default: 0 },
  casado: { type: String, default: 'false' },
  nota: { type: String, default: 'Eu amo a Menhera >.<\nVocê pode alterar esta mensagem com m!sobremim' },
  data: { type: String, default: undefined },
  shipValue: { type: String, default: null },
  ban: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  afk: { type: Boolean, default: false },
  afkReason: { type: String, default: null },
  cor: { type: String, default: '#a788ff' },
  cores: { type: Array, default: [{ nome: '0 - Padrão', cor: '#a788ff', preço: 0 }] },
  caçados: { type: Number, default: 0 },
  anjos: { type: Number, default: 0 },
  semideuses: { type: Number, default: 0 },
  deuses: { type: Number, default: 0 },
  caçarTime: { type: String, default: '000000000000' },
  rolls: { type: Number, default: 0 },
  rollTime: { type: String, default: '000000000000' },
  estrelinhas: { type: Number, default: 0 },
  votos: { type: Number, default: 0 },
  badges: { type: Array, default: [] },
});

/*

  Objeto do array das badges:
  {
    id: badgeId
    obtainAt: Date.now()
  }

*/

const warnSchema = mongoose.Schema({
  userId: String,
  warnerId: String,
  guildId: String,
  reason: String,
  data: String,
});

const familia = mongoose.model('Familia', familiaSchema);
const cmd = mongoose.model('Cmd', cmdSchema);
const guild = mongoose.model('guild', guildSchema);
const remember = mongoose.model('remember', rememberSchema);
const rpg = mongoose.model('rpg', rpgSchema);
const user = mongoose.model('usersdb', userSchema);
const warn = mongoose.model('warn', warnSchema);

module.exports.Familias = familia;
module.exports.Cmds = cmd;
module.exports.Guilds = guild;
module.exports.Reminders = remember;
module.exports.Rpg = rpg;
module.exports.Users = user;
module.exports.Warns = warn;
