/* eslint-disable camelcase */
import { BitFieldResolvable, PermissionString } from 'discord.js';

/* eslint-disable no-unused-vars */
export interface IClientConfigs {
  commandsDirectory: string;
  eventsDirectory: string;
}

export interface ICommandConfig {
  name: string;
  category: string;
  aliases: Array<string>;
  description?: string;
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
  data?: unknown;
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

interface IAbility {
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  heal: number;
  cost: number;
}

interface IUniquePower {
  name: string;
  description: string;
  cooldown: number;
  damage: number;
  heal: number;
  cost: number;
  type: string;
}

interface IMobLoot {
  name: string;
  value: number;
}

interface IUserWeapon {
  name: string;
  damage: number;
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
  type: TFamiliarBoost;
}

export interface IInventoryUser {
  name: string;
  description?: string;
  type?: string;
  job_id?: number;
  damage: number;
  value?: number;
  maxLevel?: number;
  minLevel?: number;
}

export interface IUserRpgSchema {
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

export interface IUserSchema {
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
