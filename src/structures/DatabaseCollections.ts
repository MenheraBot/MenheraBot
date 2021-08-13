import { ICmdSchema, IGuildSchema, IStatusSchema, IUserSchema } from '@utils/Types';
import { Document, Schema, model } from 'mongoose';
import { IRpgUserSchema } from './roleplay/Types';

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
  blockedChannels: { type: Array, default: [] },
  disabledCommands: { type: Array, default: [] },
  lang: { type: String, default: 'pt-BR' },
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
  shipValue: { type: String, default: Math.floor(Math.random() * 55) },
  ban: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  cor: { type: String, default: '#a788ff' },
  cores: { type: Array, default: [{ nome: '0 - Padrão', cor: '#a788ff', preço: 0 }] },
  caçados: { type: Number, default: 0 },
  giants: { type: Number, default: 0 },
  anjos: { type: Number, default: 0 },
  semideuses: { type: Number, default: 0 },
  arcanjos: { type: Number, default: 0 },
  deuses: { type: Number, default: 0 },
  caçarTime: { type: String, default: '000000000000' },
  rolls: { type: Number, default: 0 },
  estrelinhas: { type: Number, default: 0 },
  votos: { type: Number, default: 0 },
  badges: { type: Array, default: [] },
  voteCooldown: { type: String, default: '000000000000' },
  trisal: { type: Array, default: [] },
});

const rpgSchema = new Schema({
  id: { type: String, unique: true },
  classId: { type: Number },
  raceId: { type: Number },
  speed: { type: Number },
  regionId: { type: Number },
  locationId: { type: Number },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  life: { type: Number, default: 100 },
  mana: { type: Number, default: 20 },
  tiredness: { type: Number, default: 100 },
  maxLife: { type: Number, default: 100 },
  maxMana: { type: Number, default: 20 },
  baseArmor: { type: Number, default: 1 },
  baseDamage: { type: Number, default: 3 },
  attackSkill: { type: Number, default: 40 },
  abilitySkill: { type: Number, default: 40 },
  abilityPower: { type: Number, default: 1 },
  abilities: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  inHand: { type: Object },
  clanId: { type: Number, default: null },
});

export const Cmds = model<ICmdSchema & Document>('Cmd', cmdSchema);
export const Status = model<IStatusSchema & Document>('status', statusSchema);
export const Guilds = model<IGuildSchema & Document>('guild', guildSchema);
export const Users = model<IUserSchema & Document>('usersdb', userSchema);
export const Rpg = model<IRpgUserSchema & Document>('rpg', rpgSchema);
