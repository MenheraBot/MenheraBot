import { ICmdSchema, IGuildSchema, IUserSchema } from '@utils/Types';
import { Document, Schema, model } from 'mongoose';

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
  nota: { type: String, default: 'Eu amo a Menhera >.<\nUse /sobremim!' },
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
  inventory: { type: Array, default: [] },
  inUseItems: { type: Array, default: [] },
});

export const Cmds = model<ICmdSchema & Document>('Cmd', cmdSchema);
export const Guilds = model<IGuildSchema & Document>('guild', guildSchema);
export const Users = model<IUserSchema & Document>('usersdb', userSchema);
