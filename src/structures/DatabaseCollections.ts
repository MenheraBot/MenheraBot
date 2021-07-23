import {
  ICmdSchema,
  ICommandsSchema,
  IGuildSchema,
  IStatusSchema,
  IUserRpgSchema,
  IUserSchema,
} from '@utils/Types';
import { Document, Schema, model } from 'mongoose';

const statusSchema = new Schema({
  _id: { type: String },
  ping: { type: Number, default: 0 },
  disabledCommands: { type: Array },
  guilds: { type: Number, default: 0 },
  uptime: { type: String, default: '0' },
  lastPingAt: { type: String },
});

const cmdSchema = new Schema({
  _id: { type: String },
  maintenance: { type: Boolean, default: false },
  maintenanceReason: { type: String, default: '' },
});

const guildSchema = new Schema({
  id: { type: String, unique: true },
  prefix: { type: String, default: process.env.BOT_PREFIX },
  blockedChannels: { type: Array, default: [] },
  disabledCommands: { type: Array, default: [] },
  lang: { type: String, default: 'pt-BR' },
});

const rpgSchema = new Schema({
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
  backpack: { type: Object, default: { name: 'Mochila de Pele de Lobo' } },
  resetRoll: { type: Number, default: 0 },
  jobId: { type: Number, default: 0 },
  jobCooldown: { type: String, default: '00000000' },
  familiar: { type: Object, default: {} },
});

const userSchema = new Schema({
  id: { type: String, unique: true },
  mamadas: { type: Number, default: 0 },
  mamou: { type: Number, default: 0 },
  casado: { type: String, default: 'false' },
  nota: {
    type: String,
    default: 'Eu amo a Menhera >.<\nVocê pode alterar esta mensagem com m!sobremim',
  },
  data: { type: String, default: undefined },
  shipValue: { type: String, default: null },
  ban: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  afk: { type: Boolean, default: false },
  afkReason: { type: String, default: null },
  afkGuild: { type: String, default: null },
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
  voteCooldown: { type: String, default: '000000000000' },
  trisal: { type: Array, default: [] },
});

/*
  Objeto do array das badges:
  {
    id: badgeId
    obtainAt: Date.now()
  }
*/

const commandsSchema = new Schema({
  name: { type: String },
  pt_description: { type: String },
  pt_usage: { type: String },
  us_description: { type: String },
  us_usage: { type: String },
  category: { type: String },
});

export const Cmds = model<ICmdSchema & Document>('Cmd', cmdSchema);
export const Commands = model<ICommandsSchema & Document>('commands', commandsSchema);
export const Status = model<IStatusSchema & Document>('status', statusSchema);
export const Guilds = model<IGuildSchema & Document>('guild', guildSchema);
export const Rpg = model<IUserRpgSchema & Document>('rpg', rpgSchema);
export const Users = model<IUserSchema & Document>('usersdb', userSchema);
