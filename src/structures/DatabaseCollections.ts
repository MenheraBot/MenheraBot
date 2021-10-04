import { ICmdSchema, IGuildSchema, IUserSchema } from '@utils/Types';
import { Document, Schema, model } from 'mongoose';
import { IHomeSchema, IRpgUserSchema } from '../roleplay/Types';

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
  id: { type: String, unique: true }, // User Id
  classId: { type: Number }, // Id from user class
  raceId: { type: Number }, // Id from user race
  locationId: { type: Number, default: 0 }, // Id from the region that the user are
  level: { type: Number, default: 1 }, // User Level
  xp: { type: Number, default: 0 }, // User xp
  life: { type: Number, default: 100 }, // User Life
  mana: { type: Number, default: 20 }, // User mana
  tiredness: { type: Number, default: 100 }, // percentage of tiredness of user, 100 = good, 0 = bad
  lucky: { type: Number, default: 1 }, // Base lucky for gettinh loots
  attackSkill: { type: Number }, // Facility of dealling damage with basic attack
  abilitySkill: { type: Number }, // Facility of dealling damage with all abilities
  abilities: { type: Array, default: [] }, // User abilities
  inventory: { type: Array, default: [] }, // User inventory of usable items
  equiped: { type: Object }, // User inventory of equiped itens
  job: { type: Object }, // Informations about the user job
  homes: { type: Array, default: [] }, // Id of all user homes
  cooldown: { type: Object }, // All cooldowns that block the user form using commands for some reason
  money: { type: Object, default: { gold: 0, silver: 0, bronze: 0 } }, // All the money from user
  quests: { type: Object }, // This object has the available daily quests and the extra quests
  clanId: { type: Number, default: null }, // Id from the user's clan
});

const homeSchema = new Schema({
  ownerId: { type: String },
  locationId: { type: Number },
  name: { type: String },
  isClanHome: { type: Boolean, default: false },
  inventory: { type: Array, default: [] },
});

export const Cmds = model<ICmdSchema & Document>('Cmd', cmdSchema);
export const Guilds = model<IGuildSchema & Document>('guild', guildSchema);
export const Users = model<IUserSchema & Document>('usersdb', userSchema);
export const Rpg = model<IRpgUserSchema & Document>('rpg', rpgSchema);
export const Homes = model<IHomeSchema & Document>('homes', homeSchema);
