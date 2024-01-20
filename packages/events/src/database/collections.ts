import mongoose from 'mongoose';

import {
  DatabaseCommandSchema,
  DatabaseCreditsSchema,
  DatabaseFarmerSchema,
  DatabaseFeirinhaSchema,
  DatabaseGuildSchema,
  DatabaseProfileImagesSchema,
  DatabaseTitlesSchema,
  DatabaseUserSchema,
  DatabaseUserThemesSchema,
} from '../types/database';

const { Schema, model } = mongoose;

const cmdSchema = new Schema({
  _id: { type: String },
  maintenance: { type: Boolean, default: false },
  maintenanceReason: { type: String, default: '' },
  discordId: { type: String, default: null },
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
  profileImages: { type: Array, default: [{ id: 1, aquiredAt: 0 }] },
  selectedImage: { type: Number, default: 1 },
  selectedCardTheme: { type: Number, default: 4 },
  selectedProfileTheme: { type: Number, default: 3 },
  selectedTableTheme: { type: Number, default: 5 },
  selectedCardBackgroundTheme: { type: Number, default: 6 },
  selectedEbBackgroundTheme: { type: Number, default: 25 },
  selectedEbTextBoxTheme: { type: Number, default: 26 },
  selectedEbMenheraTheme: { type: Number, default: 27 },
  notifyPurchase: { type: Boolean, default: true },
  customizedProfile: { type: Array, default: [] },
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
  bannedSince: { type: String, default: null },
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
  titles: { type: Array, default: [] },
  currentTitle: { type: Number, default: 0 },
  hiddingBadges: { type: Array, default: [] },
  voteCooldown: { type: Number, default: 0 },
  trisal: { type: Array, default: [] },
  inventory: { type: Array, default: [] },
  inUseItems: { type: Array, default: [] },
  lastCommandAt: { type: Number, default: 0 },
  isBot: { type: Boolean, default: false },
  inactivityWarned: { type: Boolean, default: false },
});

const themeCredits = new Schema({
  themeId: { type: Number, unique: true, index: true },
  ownerId: { type: String },
  royalty: { type: Number, default: 7 },
  totalEarned: { type: Number, default: 0 },
  timesSold: { type: Number, default: 0 },
  registeredAt: { type: Number, default: Date.now },
});

const profileImagesSchema = new Schema({
  imageId: { type: Number, unique: true, index: true },
  uploaderId: { type: String },
  name: { type: String },
  totalEarned: { type: Number, default: 0 },
  timesSold: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  registeredAt: { type: Number, default: Date.now },
  isPublic: { type: Boolean, default: true },
});

const farmerSchema = new Schema({
  id: { type: String, unique: true, index: true },
  plantations: { type: Array, default: [{ isPlanted: false }] },
  seeds: { type: Array, default: [] },
  silo: { type: Array, default: [] },
  experience: { type: Number, deafult: 0 },
  siloUpgrades: { type: Number, default: 0 },
  biggestSeed: { type: Number, default: 0 },
  plantedFields: { type: Number, default: 0 },
  lastPlantedSeed: { type: Number, default: 0 },
  dailies: { type: Array, default: [] },
  dailyDayId: { type: Number, default: 0 },
});

const titlesSchema = new Schema({
  titleId: { type: Number, unique: true, index: true },
  text: { type: String },
  textLocalizations: { type: Object, default: null },
  registeredAt: { type: Number, default: Date.now },
});

const feirinhaSchema = new Schema({
  userId: { type: String },
  plantType: { type: Number },
  amount: { type: Number },
  price: { type: Number },
  [`name_pt-BR`]: { type: String },
  [`name_en-US`]: { type: String },
});

export const commandsModel = model<DatabaseCommandSchema>('command', cmdSchema);
export const guildsModel = model<DatabaseGuildSchema>('guild', guildSchema);
export const usersModel = model<DatabaseUserSchema>('usersdb', userSchema);
export const userThemesModel = model<DatabaseUserThemesSchema>('themes', userThemes);
export const themeCreditsModel = model<DatabaseCreditsSchema>('credits', themeCredits);
export const profileImagesModel = model<DatabaseProfileImagesSchema>('images', profileImagesSchema);
export const farmerModel = model<DatabaseFarmerSchema>('farmer', farmerSchema);
export const titlesModel = model<DatabaseTitlesSchema>('titles', titlesSchema);
export const feirinhaModel = model<DatabaseFeirinhaSchema>('feirinha', feirinhaSchema);
