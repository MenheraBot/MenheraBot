/* eslint-disable camelcase */
import BadgeRepository from '@database/repositories/BadgeRepository';
import BlacklistRepository from '@database/repositories/BlacklistRepository';
import CacheRepository from '@database/repositories/CacheRepository';
import CmdRepository from '@database/repositories/CmdsRepository';
import GiveRepository from '@database/repositories/GiveRepository';
import GuildsRepository from '@database/repositories/GuildsRepository';
import HuntRepository from '@database/repositories/HuntRepository';
import MaintenanceRepository from '@database/repositories/MaintenanceRepository';
import MamarRepository from '@database/repositories/MamarRepository';
import RelationshipRepository from '@database/repositories/RelationshipRepository';
import StarRepository from '@database/repositories/StarRepository';
import TopRepository from '@database/repositories/TopRepository';
import UserRepository from '@database/repositories/UserRepository';
import {
  ApplicationCommandOptionData,
  ChatInputApplicationCommandData,
  ColorResolvable,
  CommandInteractionOption,
  PermissionResolvable,
  User,
} from 'discord.js-light';
import { Document } from 'mongoose';

export interface IClientConfigs {
  interactionsDirectory: string;
  eventsDirectory: string;
}

export interface IInteractionCommandConfig extends ChatInputApplicationCommandData {
  devsOnly?: boolean;
  category: string;
  cooldown?: number;
  userPermissions?: PermissionResolvable[];
  clientPermissions?: PermissionResolvable[];
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
  cor: ColorResolvable;
  cores: Array<IColor>;
  caçados: number;
  giants: number;
  anjos: number;
  arcanjos: number;
  semideuses: number;
  deuses: number;
  caçarTime: string;
  rolls: number;
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
  args: Readonly<CommandInteractionOption[]>;
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

export interface IRESTHuntStats {
  user_id: string;
  demon_tries: number;
  demon_success: number;
  demon_hunted: number;
  giant_tries: number;
  giant_success: number;
  giant_hunted: number;
  angel_tries: number;
  angel_success: number;
  angel_hunted: number;
  archangel_tries: number;
  archangel_success: number;
  archangel_hunted: number;
  demigod_tries: number;
  demigod_success: number;
  demigod_hunted: number;
  god_tries: number;
  god_success: number;
  god_hunted: number;
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

export interface IDisabled {
  isDisabled: boolean;
  reason: string;
}

export interface ICmdSchema {
  _id?: string;
  maintenance: boolean;
  maintenanceReason: string | null;
}

export interface ICommandsData {
  name: string;
  category: string;
  cooldown: number;
  description: string;
  options: ApplicationCommandOptionData[];
  disabled: IDisabled;
}

export interface IStatusData {
  id: number;
  memoryUsed: number;
  uptime: number;
  guilds: number;
  unavailable: number;
  ping: number;
  lastPingAt: number;
  members: number;
}

export interface IDatabaseRepositories {
  userRepository: UserRepository;
  cacheRepository: CacheRepository;
  cmdRepository: CmdRepository;
  starRepository: StarRepository;
  mamarRepository: MamarRepository;
  guildRepository: GuildsRepository;
  badgeRepository: BadgeRepository;
  maintenanceRepository: MaintenanceRepository;
  huntRepository: HuntRepository;
  relationshipRepository: RelationshipRepository;
  blacklistRepository: BlacklistRepository;
  topRepository: TopRepository;
  giveRepository: GiveRepository;
}

export type TShardStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
