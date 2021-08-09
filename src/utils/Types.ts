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
import StarRepository from '@database/repositories/StarRepository';
import StatusRepository from '@database/repositories/StatusRepository';
import TopRepository from '@database/repositories/TopRepository';
import UserRepository from '@database/repositories/UserRepository';
import { ApplicationCommandData, ColorResolvable, PermissionResolvable, User } from 'discord.js';
import { Document } from 'mongoose';

export interface IClientConfigs {
  commandsDirectory: string;
  interactionsDirectory: string;
  eventsDirectory: string;
}

export interface IInteractionCommandConfig extends ApplicationCommandData {
  devsOnly?: boolean;
  category: string;
  cooldown?: number;
  userPermissions?: PermissionResolvable[];
  clientPermissions?: PermissionResolvable[];
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
  cor: ColorResolvable;
  price: number;
}

interface IBadge {
  id: number;
  obtainAt: string;
}

export interface IGuildSchema {
  readonly id?: string;
  prefix: string;
  blockedChannels: Array<string>;
  disabledCommands: Array<string>;
  lang: string;
}

export interface IUserSchema {
  readonly id: string;
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
  cor: ColorResolvable;
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
  authorId: string;
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
  cor: ColorResolvable;
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
export interface IContextData {
  user: IUserSchema & Document;
  server: IGuildSchema | (IGuildSchema & Document);
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

export interface IDatabaseRepositories {
  userRepository: UserRepository;
  cacheRepository: CacheRepository;
  commandRepository: CommandRepository;
  cmdRepository: CmdRepository;
  starRepository: StarRepository;
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

export type TShardStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface IAfkUserData {
  afk: boolean;
  afkGuild: string | null;
  afkReason: string | null;
}
