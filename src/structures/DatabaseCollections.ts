import { ICmdSchema, IGuildSchema, IUserPreferencesSchema, IUserSchema } from '@utils/Types';
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
  censored: { type: Boolean, default: false },
});

const userPreferences = new Schema({
  id: { type: String, unique: true, index: true },
  cardsThemes: { type: Array, default: [{ id: 4, aquiredAt: 0 }] },
  tableThemes: { type: Array, default: [{ id: 5, aquiredAt: 0 }] },
  profileTheme: { type: Array, default: [{ id: 3, aquiredAt: 0 }] },
  selectedCardTheme: { type: String, default: 'default' },
  selectedProfileTheme: { type: String, default: 'default' },
  selectedTableTheme: { type: String, default: 'green' },
});

const userSchema = new Schema({
  id: { type: String, unique: true, index: true },
  mamado: { type: Number, default: 0 },
  mamou: { type: Number, default: 0 },
  married: { type: String, default: null },
  info: { type: String, default: '' },
  marriedDate: { type: String, default: null },
  ban: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  selectedColor: { type: String, default: '#a788ff' },
  colors: { type: Array, default: [] },
  demons: { type: Number, default: 0 },
  giants: { type: Number, default: 0 },
  angels: { type: Number, default: 0 },
  demigods: { type: Number, default: 0 },
  archangels: { type: Number, default: 0 },
  gods: { type: Number, default: 0 },
  huntCooldown: { type: Number, default: 0 },
  rolls: { type: Number, default: 0 },
  estrelinhas: { type: Number, default: 0 },
  votes: { type: Number, default: 0 },
  badges: { type: Array, default: [] },
  voteCooldown: { type: Number, default: 0 },
  trisal: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  inUseItems: { type: Array, default: [] },
  itemsLimit: { type: Number, default: 1 },
  lastCommandAt: { type: Number, default: 0 },
  isBot: { type: Boolean, default: false },
});

export const Cmds = model<ICmdSchema>('Cmd', cmdSchema);
export const Guilds = model<IGuildSchema>('guild', guildSchema);
export const Users = model<IUserSchema>('usersdb', userSchema);
export const Preferences = model<IUserPreferencesSchema>('userPrefs', userPreferences);
