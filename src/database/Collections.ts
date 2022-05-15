import {
  ICmdSchema,
  IGuildSchema,
  IUserThemesSchema,
  IUserSchema,
  CreditsSchema,
  FluffetySchema,
} from '@custom_types/Menhera';
import { Schema, model } from 'mongoose';
import { RoleplayUserSchema } from '@roleplay/Types';
import { FluffetyRelationshipSchema } from '@fluffety/Types';

const cmdSchema = new Schema({
  _id: { type: String },
  maintenance: { type: Boolean, default: false },
  maintenanceReason: { type: String, default: '' },
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
  selectedCardTheme: { type: Number, default: 4 },
  selectedProfileTheme: { type: Number, default: 3 },
  selectedTableTheme: { type: Number, default: 5 },
  selectedCardBackgroundTheme: { type: Number, default: 6 },
  notifyPurchase: { type: Boolean, default: true },
});

const userSchema = new Schema({
  id: { type: String, unique: true, index: true },
  mamado: { type: Number, default: 0 },
  mamou: { type: Number, default: 0 },
  married: { type: String, default: null },
  marriedAt: { type: Number, default: null },
  marriedDate: { type: String, default: null },
  info: { type: String, default: '' },
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

const fluffetySchema = new Schema({
  ownerId: { type: String },
  fluffetyName: { type: String },
  race: { type: String },
  currentAction: { type: Object, default: { identifier: 0 } },
  /*
  TODO: in the Future
  healthyAt: { type: Number, default: 0 },
  foodyAt: { type: Number, default: 0 },
  */
  happyAt: { type: Number, default: Date.now },
  energyAt: { type: Number, default: Date.now },
});

const fluffetyRelationshipSchema = new Schema({
  leftOwner: { type: String },
  rightOwner: { type: String },
  leftName: { type: String },
  rightName: { type: String },
  relationshipExperience: { type: Number },
  relationshipLevel: { type: Number },
});

export const Cmds = model<ICmdSchema>('Cmd', cmdSchema);
export const Guilds = model<IGuildSchema>('guild', guildSchema);
export const Users = model<IUserSchema>('usersdb', userSchema);
export const Themes = model<IUserThemesSchema>('themes', userThemes);
export const Credits = model<CreditsSchema>('credits', themeCredits);
export const Rpgs = model<RoleplayUserSchema>('roleplay', rpgSchema);
export const Fluffetys = model<FluffetySchema>('fluffety', fluffetySchema);
export const Relations = model<FluffetyRelationshipSchema>('relations', fluffetyRelationshipSchema);
