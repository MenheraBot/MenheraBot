import { ICmdSchema, IGuildSchema, IUserSchema } from '@utils/Types';
import { Schema, model } from 'mongoose';

const cmdSchema = new Schema({
  _id: { type: String },
  maintenance: { type: Boolean, default: false },
  maintenanceReason: { type: String, default: '' },
});

const guildSchema = new Schema({
  id: { type: String, unique: true, index: true },
  blockedChannels: { type: Array, default: [] },
  disabledCommands: { type: Array, default: [] },
  lang: { type: String, default: 'pt-BR' },
});

const userSchema = new Schema({
  id: { type: String, unique: true, index: true },
  mamado: { type: Number },
  mamou: { type: Number, default: 0 },
  mamadas: { type: Number, default: 0 }, // Rename to mamado
  casado: { type: String, default: 'false' }, // Rename to married
  married: { type: String },
  info: { type: String },
  nota: { type: String, default: 'Eu amo a Menhera >.<\nUse /sobremim!' }, // Rename to info
  data: { type: String, default: undefined }, // Rename to marriedData
  marriedData: { type: String },
  ban: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  selectedColor: { type: String },
  cor: { type: String, default: '#a788ff' }, // Rename to color
  cores: { type: Array, default: [{ nome: '0 - Padrão', cor: '#a788ff', preço: 0 }] }, // Rename to colors
  colors: { type: Array },
  caçados: { type: Number, default: 0 }, // Rename to demons
  demons: { type: Number, default: 0 },
  giants: { type: Number, default: 0 },
  angels: { type: Number },
  anjos: { type: Number, default: 0 }, // Rename to angels
  demigods: { type: Number },
  semideuses: { type: Number, default: 0 }, // Rename to demigods
  archangels: { type: Number },
  arcanjos: { type: Number, default: 0 }, // Rename to archangels
  gods: { type: Number },
  deuses: { type: Number, default: 0 }, // Rename to gods
  caçarTime: { type: String, default: '000000000000' }, // Rename to huntCooldown
  huntCooldown: { type: Number, default: 0 },
  rolls: { type: Number, default: 0 },
  estrelinhas: { type: Number, default: 0 },
  votos: { type: Number, default: 0 }, // Rename to votes
  votes: { type: Number },
  badges: { type: Array, default: [] },
  voteCooldown: { type: Number, default: 0 },
  trisal: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  inUseItems: { type: Array, default: [] },
  itemsLimit: { type: Number, default: 1 },
});

export const Cmds = model<ICmdSchema>('Cmd', cmdSchema);
export const Guilds = model<IGuildSchema>('guild', guildSchema);
export const Users = model<IUserSchema>('usersdb', userSchema);
