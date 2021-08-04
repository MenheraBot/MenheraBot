/* eslint-disable camelcase */
import BadgeRepository from '@database/repositories/BadgeRepository';
import BlacklistRepository from '@database/repositories/BlacklistRepository';
import CacheRepository from '@database/repositories/CacheRepository';
import CmdRepository from '@database/repositories/CmdsRepository';
import CommandRepository from '@database/repositories/CommandRepository';
import GiveRepository from '@database/repositories/GiveRepository';
import GuildsRepository from '@database/repositories/GuildsRepository';
import HuntRepository from '@database/repositories/HuntRepository';
import MaintenanceRepository from '@database/repositories/MaintenanceRepository';
import MamarRepository from '@database/repositories/MamarRepository';
import RelationshipRepository from '@database/repositories/RelationshipRepository';
import RpgRepository from '@database/repositories/RpgRepository';
import StarRepository from '@database/repositories/StarRepository';
import StatusRepository from '@database/repositories/StatusRepository';
import TopRepository from '@database/repositories/TopRepository';
import UserRepository from '@database/repositories/UserRepository';
import { PermissionResolvable, User } from 'discord.js';
import { Document } from 'mongoose';

/* eslint-disable no-unused-vars */
export interface IClientConfigs {
  commandsDirectory: string;
  eventsDirectory: string;
}

export interface ICommandConfig {
  name: string;
  category: string;
  aliases?: Array<string>;
  cooldown?: number;
  userPermissions?: PermissionResolvable[];
  clientPermissions?: PermissionResolvable[];
  devsOnly?: boolean;
}

export interface IHttpPicassoReutrn {
  err: boolean;
  data?: Buffer;
}

export interface IBlackjackCards {
  value: number;
  isAce: boolean;
  id: number;
  hidden?: boolean;
}

interface IColor {
  nome: string;
  cor: string;
  price: number;
}

interface IBadge {
  id: number;
  obtainAt: string;
}

export interface IAbility {
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  heal: number;
  cost: number;
}

export interface IUniquePower {
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  heal: number;
  cost: number;
  type: string;
}

export interface IMobLoot {
  name: string;
  value: number;
}
interface IUserWeapon {
  name: string;
  damage: number;
  type?: string;
}

interface IUserArmor {
  name: string;
  armor: number;
}

type TFamiliarBoost = 'abilityPower' | 'damage' | 'armor';

export type TFamiliarID = 1 | 2 | 3;

export type TJobIndexes = 1 | 2 | 3 | 4;

interface IUserFamiliar {
  id: TFamiliarID;
  level: number;
  xp: number;
  nextLevelXp: number;
  type: TFamiliarBoost;
}

export interface IInventoryItem {
  name: string;
  description?: string;
  type?: string;
  job_id?: number;
  damage?: number;
  value?: number;
  maxLevel?: number;
  minLevel?: number;
}

export interface IGuildSchema {
  id?: string;
  prefix: string;
  blockedChannels: Array<string>;
  disabledCommands: Array<string>;
  lang: string;
}
export interface IUserRpgSchema extends Document {
  _id: string;
  class: string;
  life: number;
  armor: number;
  damage: number;
  mana: number;
  maxLife: number;
  maxMana: number;
  abilityPower: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  abilities: Array<IAbility>;
  uniquePower: IUniquePower;
  loots: Array<IMobLoot>;
  inventory: Array<IInventoryItem>;
  money: number;
  dungeonCooldown: string;
  death: string;
  weapon: IUserWeapon;
  protection: IUserArmor;
  hotelTime: string;
  inBattle: boolean;
  backpack: { name: string };
  resetRoll: number;
  jobId: TJobIndexes;
  jobCooldown: string;
  familiar: IUserFamiliar;
}

export interface IUserSchema extends Document {
  id: string;
  mamadas: number;
  mamou: number;
  casado: string;
  nota: string;
  data?: string | null;
  shipValue?: string;
  ban?: boolean;
  banReason?: string | null;
  afk: boolean;
  afkReason: string | null;
  afkGuild: string | null;
  cor: string;
  cores: Array<IColor>;
  caçados: number;
  anjos: number;
  semideuses: number;
  deuses: number;
  caçarTime: string;
  rolls: number;
  rollTime: string;
  estrelinhas: number;
  votos: number;
  badges: Array<IBadge>;
  voteCooldown: string;
  trisal: Array<string>;
}

export interface ICommandUsedData {
  authorName: string;
  authorId: string;
  guildName: string;
  guildId: string;
  commandName: string;
  data: number;
  args: string;
}

export interface IRESTGameStats {
  playedGames: number;
  lostGames: number;
  winGames: number;
  winMoney: number;
  lostMoney: number;
  winPorcentage: string;
  lostPorcentage: string;
  error?: boolean;
}

export interface IUserDataToProfile {
  cor: string;
  avatar: string;
  votos: number;
  nota: string;
  tag: string;
  flagsArray: Array<string>;
  casado: string | User;
  voteCooldown: string;
  badges: Array<IBadge>;
  username: string;
  data: string;
  mamadas: number;
  mamou: number;
}

export interface IMobAttack {
  name: string;
  damage: number;
}

export interface IContextData {
  user: IUserSchema & Document;
  server: IGuildSchema | (IGuildSchema & Document);
}

export type mobType =
  | 'inicial'
  | 'medio'
  | 'hard'
  | 'impossible'
  | 'Boss'
  | 'God'
  | 'Evolved'
  | 'Universal';

export interface IDungeonMob {
  loots: Array<IMobLoot>;
  ataques: Array<IMobAttack>;
  type?: mobType;
  name: string;
  life: number;
  damage: string;
  armor: number;
  xp: number;
  dgLevel?: number;
}

export interface IBattleChoice {
  name: string;
  damage: number | string;
  scape?: boolean;
  cost: number;
  heal?: number;
}

export interface ICmdSchema {
  _id?: string;
  maintenance: boolean;
  maintenanceReason: string | null;
}

export interface ICommandsSchema extends Document {
  name: string;
  pt_description: string;
  pt_usage: string;
  us_description: string;
  us_usage: string;
  category: string;
}

interface IDisabledCommand {
  name: string;
  reason: string;
}

export interface IStatusSchema extends Document {
  _id: string;
  ping: number;
  disabledCommands: Array<IDisabledCommand>;
  guilds: number;
  uptime: string;
  lastPingAt: string;
}

export interface IUserDataToSend {
  life: number;
  maxLife: number;
  mana: number;
  maxMana: number;
  xp: number;
  level: number;
  nextLevelXp: number;
  damage: number;
  armor: number;
  abilityPower: number;
  tag: string;
  money: number;
  jobId: number;
}
export interface IDatabaseRepositories {
  userRepository: UserRepository;
  cacheRepository: CacheRepository;
  commandRepository: CommandRepository;
  cmdRepository: CmdRepository;
  starRepository: StarRepository;
  rpgRepository: RpgRepository;
  mamarRepository: MamarRepository;
  guildRepository: GuildsRepository;
  statusRepository: StatusRepository;
  badgeRepository: BadgeRepository;
  maintenanceRepository: MaintenanceRepository;
  huntRepository: HuntRepository;
  relationshipRepository: RelationshipRepository;
  blacklistRepository: BlacklistRepository;
  topRepository: TopRepository;
  giveRepository: GiveRepository;
}

export type TVilaOptions = 'bruxa' | 'ferreiro' | 'hotel' | 'guilda';

export type TFerreiroOptions = 'sword' | 'armor' | 'backpack';

export interface IMobsFile {
  inicial: IDungeonMob[];
  medio: IDungeonMob[];
  hard: IDungeonMob[];
  impossible: IDungeonMob[];
  boss: IDungeonMob[];
  gods: IDungeonMob[];
  evolved: IDungeonMob[];
  universal: IDungeonMob[];
}

export interface IClassAbilities {
  uniquePowers: IUniquePower[];
  normalAbilities: IAbility[];
}

export interface IAbilitiesFile {
  assassin: IClassAbilities;
  barbarian: IClassAbilities;
  clerigo: IClassAbilities;
  druida: IClassAbilities;
  espadachim: IClassAbilities;
  feiticeiro: IClassAbilities;
  monge: IClassAbilities;
  necromante: IClassAbilities;
}

interface IFamiliarBoost {
  name: string;
  type: TFamiliarBoost;
  level_boost: number;
  value: number;
}

export interface IFamiliarFromFile {
  id: TFamiliarID;
  boost: IFamiliarBoost;
  image: string;
}

export interface IFamiliarFile {
  1: IFamiliarFromFile;
  2: IFamiliarFromFile;
  3: IFamiliarFromFile;
}

export interface IJobFromFile {
  name: string;
  min_level: number;
  work_cooldown_in_hours: number;
  xp: number;
  min_money: number;
  max_money: number;
}

export interface IJobFile {
  1: IJobFromFile;
  2: IJobFromFile;
  3: IJobFromFile;
  4: IJobFromFile;
}

export type TDungeonLevel = 1 | 2 | 3 | 4 | 5;

export interface IBruxaItem {
  name: string;
  description: string;
  type: string;
  damage: number;
  value: number;
  maxLevel?: number;
  minLevel: number;
}

export interface IRequiredItems {
  [name: string]: number;
}

export interface IFerreiroItem {
  id: string;
  price?: number;
  protection?: number;
  capacity?: number;
  isNotTrade?: boolean;
  damage?: number;
  category: string;
  required_items?: IRequiredItems;
}

export interface IHotelItem {
  name: string;
  time: number;
  life: number | 'MAX';
  mana: number | 'MAX';
}

export interface IJobsItem {
  name: string;
  value: number;
  job_id: TJobIndexes;
}

interface IJobsFromFile {
  1: IJobsItem[];
  2: IJobsItem[];
  3: IJobsItem[];
  4: IJobsItem[];
}

export interface IITemsFile {
  bruxa: IBruxaItem[];
  ferreiro: IFerreiroItem[];
  hotel: IHotelItem[];
  jobs: IJobsFromFile;
}

export type TShardStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface IShardFromClient {
  id: number;
  status: TShardStatus;
  sequence: number;
  closeSequence: number;
  sessionID: string;
  ping: number;
  lastPingTimestamp: number;
  lastHeartbeatAcked: boolean;
}

export interface IShardArrayFromWs {
  _events: unknown;
  _eventsCount: number;
  gateway: string;
  totalShards: number;
  shards: IShardFromClient[];
  status: TShardStatus;
  destroyed: boolean;
  reconnecting: boolean;
  sessionStartLimit: unknown;
}

export interface IAfkUserData {
  afk: boolean;
  afkGuild: string | null;
  afkReason: string | null;
}
