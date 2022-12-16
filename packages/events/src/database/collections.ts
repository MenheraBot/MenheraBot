import mongoose from 'mongoose';

import {
  DatabaseCommandSchema,
  DatabaseCreditsSchema,
  DatabaseGuildSchema,
  DatabaseUserSchema,
  DatabaseUserThemesSchema,
} from '../types/database';
import { DatabaseRoleplayUserSchema } from '../modules/roleplay/types';

const { Schema, model } = mongoose;

const cmdSchema = new Schema({
  _id: { type: String },
  maintenance: { type: Boolean, default: false },
  maintenanceReason: { type: String, default: '' },
  discordId: { type: String, default: '0' },
});

const guildSchema = new Schema({
  id: { type: String, unique: true, index: true },
  lang: { type: String, default: 'pt-BR' },
});

const userThemes = new Schema({
  id: { type: String, unique: true, index: true },
  cardsThemes: { type: Array, default: [{ id: 4, aquiredAt: 0 }] },
  tableThemes: { type: Array, default: [{ id: 5, aquiredAt: 0 }] },
  profileThemes: { type: Array, default: [{ id: 3, aquiredAt: 0 }] },
  cardsBackgroundThemes: { type: Array, default: [{ id: 6, aquiredAt: 0 }] },
  ebBackgroundThemes: { type: Array, default: [{ id: 25, aquiredAt: 0 }] },
  ebTextBoxThemes: { type: Array, default: [{ id: 26, aquiredAt: 0 }] },
  ebMenheraThemes: { type: Array, default: [{ id: 27, aquiredAt: 0 }] },
  selectedCardTheme: { type: Number, default: 4 },
  selectedProfileTheme: { type: Number, default: 3 },
  selectedTableTheme: { type: Number, default: 5 },
  selectedCardBackgroundTheme: { type: Number, default: 6 },
  selectedEbBackgroundTheme: { type: Number, default: 25 },
  selectedEbTextBoxTheme: { type: Number, default: 26 },
  selectedEbMenheraTheme: { type: Number, default: 27 },
  notifyPurchase: { type: Boolean, default: true },
});

const userSchema = new Schema({
  id: { type: String, unique: true, index: true },
  mamado: { type: Number, default: 0 },
  mamou: { type: Number, default: 0 },
  married: { type: String, default: null },
  marriedAt: { type: Number, default: null },
  marriedDate: { type: String, default: null },
  info: { type: String, default: 'OwO >.<' },
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
  hiddingBadges: { type: Array, default: [] },
  voteCooldown: { type: Number, default: 0 },
  trisal: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  inUseItems: { type: Array, default: [] },
  itemsLimit: { type: Number, default: 1 },
  lastCommandAt: { type: Number, default: 0 },
  isBot: { type: Boolean, default: false },
});

const themeCredits = new Schema({
  themeId: { type: Number, unique: true, index: true },
  ownerId: { type: String },
  royalty: { type: Number, default: 3 },
  totalEarned: { type: Number, default: 0 },
  timesSold: { type: Number, default: 0 },
  registeredAt: { type: Number, default: Date.now },
});

const rpgSchema = new Schema({
  id: { type: String },
  class: { type: Number },
  race: { type: Number },
  life: { type: Number },
  mana: { type: Number },
  level: { type: Number },
  experience: { type: Number, default: 0 },
  abilities: { type: Array, default: [] },
  holyBlessings: { type: Object, default: { ability: 0, vitality: 0, battle: 0 } },
  blesses: {
    type: Object,
    default: {
      maxLife: 0,
      maxMana: 0,
      agility: 0,
      armor: 0,
      damage: 0,
      intelligence: 0,
    },
  },
  inventory: { type: Array, default: [] },
  money: { type: Number, default: 0 },
  cooldowns: { type: Array, default: [] },
  weapon: { type: Object, default: { id: 102, level: 1 } },
  protection: { type: Object, default: { id: 101, level: 1 } },
  backpack: { type: Object, default: { id: 100, level: 1 } },
});

export const commandsModel = model<DatabaseCommandSchema>('command', cmdSchema);
export const guildsModel = model<DatabaseGuildSchema>('guild', guildSchema);
export const usersModel = model<DatabaseUserSchema>('usersdb', userSchema);
export const userThemesModel = model<DatabaseUserThemesSchema>('themes', userThemes);
export const themeCreditsModel = model<DatabaseCreditsSchema>('credits', themeCredits);
export const roleplayUsersModel = model<DatabaseRoleplayUserSchema>('roleplay', rpgSchema);
