/* eslint-disable camelcase */
import { BitFieldResolvable, PermissionString, User } from 'discord.js';
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
  userPermissions?: BitFieldResolvable<PermissionString>[];
  clientPermissions?: BitFieldResolvable<PermissionString>[];
  devsOnly?: boolean;
}

export interface IEvent {
  name: string;
  dir: string;
  run: (...args: Array<unknown>) => Promise<unknown>;
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
  preço: number;
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

interface IUserFamiliar {
  id: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  type: TFamiliarBoost | string;
}

export interface IInventoryUser {
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
  id: string;
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
  inventory: Array<IInventoryUser>;
  money: number;
  dungeonCooldown: string;
  death: string;
  weapon: IUserWeapon;
  protection: IUserArmor;
  hotelTime: string;
  inBattle: boolean;
  backpack: { name: string };
  resetRoll: number;
  jobId: number;
  jobCooldown: string;
  familiar: IUserFamiliar;
}

export interface IUserSchema extends Document {
  id: string;
  mamadas: number;
  mamou: number;
  casado: string;
  nota: string;
  data?: string;
  shipValue?: string;
  ban?: boolean;
  banReason?: string;
  afk: boolean;
  afkReason: string;
  afkGuild?: string;
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
  playedGames?: number;
  lostGames?: number;
  winGames?: number;
  winMoney?: number;
  lostMoney?: number;
  winPorcentage?: string;
  lostPorcentage?: string;
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
  server: IGuildSchema & Document;
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
  damage: number;
  scape?: boolean;
  cost?: number;
  heal?: number;
}

export interface ICmdSchema {
  _id: string;
  maintenance: boolean;
  maintenanceReason: string;
}

export interface ICommandsSchema {
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

export interface IStatusSchema {
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
  damage: any;
  armor: any;
  abilityPower: any;
  tag: any;
  money: number;
  jobId: number;
}
