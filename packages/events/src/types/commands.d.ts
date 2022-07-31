/* eslint-disable no-use-before-define */
import { ApplicationCommandOptionTypes, ApplicationCommandTypes } from 'discordeno';

import InteractionContext from '../structures/command/InteractionContext';
import { DatabaseUserSchema } from './database';

type CommandCategory = 'economy' | 'roleplay' | 'fun' | 'actions' | 'info';

export interface ChatInputCommandConfig extends ChatInputApplicationCommandData {
  devsOnly?: true;
  category: CommandCategory;
  authorDataFields: Array<keyof DatabaseUserSchema>;
}

export interface ChatInputInteractionCommand extends Readonly<ChatInputCommandConfig> {
  path: string;

  readonly execute: (ctx: InteractionContext) => Promise<void>;
}

export const enum ApplicationCommandOptionTypes {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11,
}

export const enum ChannelTypes {
  GUILD_TEXT = 0,
  DM = 1,
  GUILD_VOICE = 2,
  GROUP_DM = 3,
  GUILD_CATEGORY = 4,
  GUILD_NEWS = 5,
  GUILD_STORE = 6,
  UNKNOWN = 7,
  GUILD_NEWS_THREAD = 10,
  GUILD_PUBLIC_THREAD = 11,
  GUILD_PRIVATE_THREAD = 12,
  GUILD_STAGE_VOICE = 13,
  GUILD_DIRECTORY = 14,
}

export declare enum Locale {
  EnglishUS = 'en-US',
  EnglishGB = 'en-GB',
  Bulgarian = 'bg',
  ChineseCN = 'zh-CN',
  ChineseTW = 'zh-TW',
  Croatian = 'hr',
  Czech = 'cs',
  Danish = 'da',
  Dutch = 'nl',
  Finnish = 'fi',
  French = 'fr',
  German = 'de',
  Greek = 'el',
  Hindi = 'hi',
  Hungarian = 'hu',
  Italian = 'it',
  Japanese = 'ja',
  Korean = 'ko',
  Lithuanian = 'lt',
  Norwegian = 'no',
  Polish = 'pl',
  PortugueseBR = 'pt-BR',
  Romanian = 'ro',
  Russian = 'ru',
  SpanishES = 'es-ES',
  Swedish = 'sv-SE',
  Thai = 'th',
  Turkish = 'tr',
  Ukrainian = 'uk',
  Vietnamese = 'vi',
}
export declare type LocaleString = `${Locale}`;
export declare type LocalizationMap = Partial<Record<LocaleString, string | null>>;

export interface BaseApplicationCommandData {
  name: string;
  nameLocalizations?: LocalizationMap;
  /** @deprecated Use {@link defaultMemberPermissions} and {@link dmPermission} instead. */
  defaultPermission?: boolean;
  defaultMemberPermissions?: PermissionResolvable | null;
  dmPermission?: boolean;
}

export type CommandOptionDataTypeResolvable = ApplicationCommandOptionTypes;

export type CommandOptionChannelResolvableType = ApplicationCommandOptionTypes.Channel;

export type CommandOptionChoiceResolvableType = ApplicationCommandOptionTypes.String;

export type CommandOptionNumericResolvableType =
  | ApplicationCommandOptionTypes.Number
  | ApplicationCommandOptionTypes.Integer;

export type CommandOptionSubOptionResolvableType =
  | ApplicationCommandOptionTypes.SubCommand
  | ApplicationCommandOptionTypes.SubCommandGroup;

export type CommandOptionNonChoiceResolvableType = Exclude<
  CommandOptionDataTypeResolvable,
  | CommandOptionChoiceResolvableType
  | CommandOptionSubOptionResolvableType
  | CommandOptionChannelResolvableType
>;

export interface BaseApplicationCommandOptionsData {
  name: string;
  nameLocalizations?: LocalizationMap;
  description: string;
  descriptionLocalizations?: LocalizationMap;
  required?: boolean;
  autocomplete?: never;
}

export interface ChatInputApplicationCommandData extends BaseApplicationCommandData {
  description: string;
  descriptionLocalizations?: LocalizationMap;
  type?: ApplicationCommandTypes.ChatInput;
  options?: ApplicationCommandOptionData[];
}

export interface ApplicationCommandChannelOptionData extends BaseApplicationCommandOptionsData {
  type: CommandOptionChannelResolvableType;
  channelTypes?: Exclude<ChannelTypes, ChannelTypes.UNKNOWN>[];
}

export interface ApplicationCommandChannelOption extends BaseApplicationCommandOptionsData {
  type: ApplicationCommandOptionTypes.Channel;
  channelTypes?: (keyof typeof ChannelTypes)[];
}

export interface ApplicationCommandAutocompleteOption
  extends Omit<BaseApplicationCommandOptionsData, 'autocomplete'> {
  type:
    | ApplicationCommandOptionTypes.String
    | ApplicationCommandOptionTypes.Number
    | ApplicationCommandOptionTypes.Integer;
  autocomplete: true;
}

export interface ApplicationCommandChoicesData
  extends Omit<BaseApplicationCommandOptionsData, 'autocomplete'> {
  type: CommandOptionChoiceResolvableType;
  choices?: ApplicationCommandOptionChoiceData[];
  autocomplete?: false;
}

export interface ApplicationCommandChoicesOption
  extends Omit<BaseApplicationCommandOptionsData, 'autocomplete'> {
  type: CommandOptionChoiceResolvableType;
  choices?: ApplicationCommandOptionChoiceData[];
  autocomplete?: false;
}

export interface ApplicationCommandNumericOptionData extends ApplicationCommandChoicesData {
  type: CommandOptionNumericResolvableType;
  minValue?: number;
  maxValue?: number;
}

export interface ApplicationCommandStringOptionData extends ApplicationCommandChoicesData {
  type: ApplicationCommandOptionTypes.String;
  minLength?: number;
  maxLength?: number;
}

export interface ApplicationCommandNumericOption extends ApplicationCommandChoicesOption {
  type: CommandOptionNumericResolvableType;
  minValue?: number;
  maxValue?: number;
}

export interface ApplicationCommandStringOption extends ApplicationCommandChoicesOption {
  type: ApplicationCommandOptionTypes.STRING;
  minLength?: number;
  maxLength?: number;
}

export interface ApplicationCommandSubGroupData
  extends Omit<BaseApplicationCommandOptionsData, 'required'> {
  type: ApplicationCommandOptionTypes.SubCommandGroup;
  options?: ApplicationCommandSubCommandData[];
}

export interface ApplicationCommandSubGroup
  extends Omit<BaseApplicationCommandOptionsData, 'required'> {
  type: ApplicationCommandOptionTypes.SubCommandGroup;
  options?: ApplicationCommandSubCommand[];
}

export interface ApplicationCommandSubCommandData
  extends Omit<BaseApplicationCommandOptionsData, 'required'> {
  type: ApplicationCommandOptionTypes.SubCommand;
  options?: (
    | ApplicationCommandChoicesData
    | ApplicationCommandNonOptionsData
    | ApplicationCommandChannelOptionData
    | ApplicationCommandAutocompleteOption
    | ApplicationCommandNumericOptionData
    | ApplicationCommandStringOptionData
  )[];
}

export interface ApplicationCommandSubCommand
  extends Omit<BaseApplicationCommandOptionsData, 'required'> {
  type: ApplicationCommandOptionTypes.SubCommand;
  options?: (
    | ApplicationCommandChoicesOption
    | ApplicationCommandNonOptions
    | ApplicationCommandChannelOption
  )[];
}

export interface ApplicationCommandNonOptionsData extends BaseApplicationCommandOptionsData {
  type: CommandOptionNonChoiceResolvableType;
}

export interface ApplicationCommandNonOptions extends BaseApplicationCommandOptionsData {
  type: Exclude<CommandOptionNonChoiceResolvableType, ApplicationCommandOptionTypes>;
}

export type ApplicationCommandOptionData =
  | ApplicationCommandSubGroupData
  | ApplicationCommandNonOptionsData
  | ApplicationCommandChannelOptionData
  | ApplicationCommandChoicesData
  | ApplicationCommandAutocompleteOption
  | ApplicationCommandNumericOptionData
  | ApplicationCommandStringOptionData
  | ApplicationCommandSubCommandData;

export type ApplicationCommandOption =
  | ApplicationCommandSubGroup
  | ApplicationCommandNonOptions
  | ApplicationCommandChannelOption
  | ApplicationCommandChoicesOption
  | ApplicationCommandNumericOption
  | ApplicationCommandStringOption
  | ApplicationCommandSubCommand;

export interface ApplicationCommandOptionChoiceData {
  name: string;
  nameLocalizations?: LocalizationMap;
  value: string | number;
}
