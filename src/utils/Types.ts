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
