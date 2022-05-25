/* eslint-disable camelcase */
import BadgeRepository from '@database/repositories/BadgeRepository';
import BlacklistRepository from '@database/repositories/BlacklistRepository';
import CacheRepository from '@database/repositories/CacheRepository';
import CmdRepository from '@database/repositories/CmdsRepository';
import CoinflipRepository from '@database/repositories/CoinflipRepository';
import GiveRepository from '@database/repositories/GiveRepository';
import GuildsRepository from '@database/repositories/GuildsRepository';
import HuntRepository from '@database/repositories/HuntRepository';
import MaintenanceRepository from '@database/repositories/MaintenanceRepository';
import MamarRepository from '@database/repositories/MamarRepository';
import RelationshipRepository from '@database/repositories/RelationshipRepository';
import StarRepository from '@database/repositories/StarRepository';
import TopRepository from '@database/repositories/TopRepository';
import ShopRepository from '@database/repositories/ShopRepository';
import ThemeRepository from '@database/repositories/ThemeRepository';

import UserRepository from '@database/repositories/UserRepository';
import {
  ApplicationCommandOptionData,
  ChatInputApplicationCommandData,
  ColorResolvable,
  CommandInteractionOption,
  User,
} from 'discord.js-light';
import CreditsRepository from '@database/repositories/CreditsRepository';
import RoleplayRepository from '@database/repositories/RoleplayRepository';
import { MayNotExists } from '@utils/Util';
// eslint-disable-next-line import/no-extraneous-dependencies
import { LocalizationMap } from 'discord-api-types/v10';

export interface IClientConfigs {
  interactionsDirectory: string;
  eventsDirectory: string;
}

export type T8BallAnswerTypes = 'negative' | 'positive' | 'neutral';

export interface IPicassoErrorReturn {
  err: true;
}

export interface ISuccessPicassoReturn {
  err?: false;
  data: Buffer;
}

export type IPicassoReturnData = IPicassoErrorReturn | ISuccessPicassoReturn;

export interface IBlackjackCards {
  value: number;
  isAce: boolean;
  id: number;
  hidden?: boolean;
}

export interface IColor {
  nome: string;
  cor: ColorResolvable;
}

interface IBadge {
  id: number;
  obtainAt: string;
}

export interface IGuildSchema {
  readonly id?: string;
  lang: string;
}

export interface IMagicItem {
  id: number;
}

export interface IUserSchema {
  readonly id: string;
  mamado: number;
  mamou: number;
  married: string | null;
  marriedDate: string | null;
  marriedAt: number | null;
  info: string;
  ban: boolean;
  banReason: string | null;
  selectedColor: ColorResolvable;
  colors: Array<IColor>;
  demons: number;
  giants: number;
  angels: number;
  archangels: number;
  demigods: number;
  gods: number;
  rolls: number;
  estrelinhas: number;
  votes: number;
  badges: Array<IBadge>;
  hiddingBadges: Array<IBadge['id']>;
  huntCooldown: number;
  voteCooldown: number;
  trisal: Array<string>;
  inventory: Array<IMagicItem>;
  inUseItems: Array<IMagicItem>;
  itemsLimit: number;
  lastCommandAt: number;
  isBot: boolean;
}

export interface CreditsSchema {
  themeId: number;
  ownerId: string;
  royalty: number;
  totalEarned: number;
  registeredAt: number;
  timesSold: number;
}

export type AvailableCardThemes = 'default' | 'death';

export type AvailableCardBackgroundThemes =
  | 'red'
  | 'blue'
  | 'cute_menhera'
  | 'premium'
  | 'kawaii'
  | 'lamenta_caelorum';

export type AvailableTableThemes =
  | 'green'
  | 'blue'
  | 'red'
  | 'pink'
  | 'rounded'
  | 'gauderios'
  | 'atemporal';

export type AvailableProfilesThemes =
  | 'default'
  | 'upsidedown'
  | 'kawaii'
  | 'christmas_2021'
  | 'warrior'
  | 'fortification'
  | 'without_soul'
  | 'id03';

export type AvailableThemeTypes = 'profile' | 'cards' | 'card_background' | 'table';

export interface IUserBuyableData {
  id: number;
  aquiredAt: number;
}

export interface IUserThemesSchema {
  readonly id: string;
  cardsThemes: Array<IUserBuyableData>;
  tableThemes: Array<IUserBuyableData>;
  profileThemes: Array<IUserBuyableData>;
  cardsBackgroundThemes: Array<IUserBuyableData>;
  selectedCardTheme: number;
  selectedTableTheme: number;
  selectedProfileTheme: number;
  selectedCardBackgroundTheme: number;
  notifyPurchase: boolean;
}

export interface IInteractionCommandConfig extends ChatInputApplicationCommandData {
  devsOnly?: boolean;
  category: string;
  cooldown?: number;
  authorDataFields?: Array<keyof IUserSchema>;
}

export interface ICommandUsedData {
  authorId: string;
  guildId: string;
  commandName: string;
  data: number;
  args: Readonly<CommandInteractionOption[]>;
  shardId: number;
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
  casado: string | User | null;
  voteCooldown: number;
  badges: Array<IBadge>;
  hiddingBadges: Array<number>;
  username: string;
  data: string;
  mamadas: number;
  mamou: number;
  marry: MayNotExists<{
    username: string;
    tag: string;
  }>;
}

export interface IContextData {
  user: IUserSchema;
  server: IGuildSchema;
}

export interface IDisabled {
  isDisabled: boolean;
  reason: string | null;
}

export interface ICmdSchema {
  _id?: string;
  maintenance: boolean;
  maintenanceReason: string | null;
}

export interface ICommandsData {
  name: string;
  nameLocalizations?: LocalizationMap;
  description: string;
  descriptionLocalizations?: LocalizationMap;
  category: string;
  cooldown: number;
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
  clusterId: number;
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
  roleplayRepository: RoleplayRepository;
  topRepository: TopRepository;
  giveRepository: GiveRepository;
  coinflipRepository: CoinflipRepository;
  shopRepository: ShopRepository;
  themeRepository: ThemeRepository;
  creditsRepository: CreditsRepository;
}

export type TShardStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface PicassoRequestData<T> {
  id: string;
  type: string;
  data: T;
}

export interface ITopResult {
  id: string;
  value: number;
}

export interface IReturnData<T> {
  id: number;
  data: T;
}
export type HuntingTypes = 'demons' | 'giants' | 'angels' | 'archangels' | 'demigods' | 'gods';

export type HuntTypes = 'demon' | 'giant' | 'angel' | 'archangel' | 'demigod' | 'god';

export interface HuntProbabiltyProps {
  amount: number;
  probability: number;
}

export interface HuntProbability {
  demons: HuntProbabiltyProps[];
  giants: HuntProbabiltyProps[];
  angels: HuntProbabiltyProps[];
  archangels: HuntProbabiltyProps[];
  demigods: HuntProbabiltyProps[];
  gods: HuntProbabiltyProps[];
}

export interface IHuntProbablyBoostItem {
  type: 'HUNT_PROBABILITY_BOOST';
  huntType: HuntingTypes;
  probabilities: HuntProbability[HuntingTypes];
  cost: number;
}

export type TItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythical' | 'divine';

export interface IBaseTheme {
  price: number;
  rarity: TItemRarity;
  isBuyable: boolean;
}

export interface ICardBackgroudTheme extends IBaseTheme {
  type: 'card_background';
  theme: AvailableCardBackgroundThemes;
}

export interface IProfileTheme extends IBaseTheme {
  type: 'profile';
  theme: AvailableProfilesThemes;
}

export interface ICardsTheme extends IBaseTheme {
  type: 'cards';
  theme: AvailableCardThemes;
}
export interface ITableTheme extends IBaseTheme {
  type: 'table';
  theme: AvailableTableThemes;
}

export type ThemeFiles = IProfileTheme | ICardsTheme | ITableTheme | ICardBackgroudTheme;

export interface IHuntCooldownBoostItem {
  type: 'HUNT_COOLDOWN_REDUCTION';
  huntType: HuntingTypes;
  huntCooldown: number;
  dropChance: number;
  rarity: TItemRarity;
}

export type TMagicItemsFile = IHuntProbablyBoostItem | IHuntCooldownBoostItem;

export enum huntEnum {
  DEMON = 'demons',
  ANGEL = 'angels',
  DEMIGOD = 'demigods',
  GIANT = 'giants',
  ARCHANGEL = 'archangels',
  GOD = 'gods',
}

export interface BetPlayer {
  id: string;
  bet: number;
  option: string;
  gameId?: number;
}

export type BichoBetType =
  | 'unity'
  | 'ten'
  | 'hundred'
  | 'thousand'
  | 'animal'
  | 'sequence'
  | 'corner';

export interface BichoWinner {
  id: string;
  profit: number;
  bet: number;
  didWin: boolean;
}

export interface JogoDoBichoGame {
  dueDate: number;
  results: number[][];
  bets: Array<BetPlayer>;
  biggestProfit: number;
}

export type ToBLess = 'mana' | 'life' | 'damage' | 'armor' | 'intelligence' | 'agility';

export interface ShardsDataReturn {
  id: number;
  ping: number;
  guilds: number;
  members: number;
  unavailable: number;
  uptime: number;
  connected: number;
}
export interface BlackjackTop {
  id: string;
  bj_wins: number;
  bj_win_money: number;
  bj_loses: number;
  bj_lose_money: number;
}

export interface CoinflipTop {
  id: string;
  cf_wins: number;
  cf_win_money: number;
  cf_loses: number;
  cf_lose_money: number;
}

export interface RouletteTop {
  user_id: string;
  earn_money: number;
  lost_games: number;
  lost_money: number;
  won_games: number;
}

export type BichoTop = RouletteTop;

export type HuntTop<Hunt extends HuntTypes> = {
  user_id: string;
} & Pick<IRESTHuntStats, `${Hunt}_success` | `${Hunt}_hunted` | `${Hunt}_tries`>;

export type BlackjackFinishGameReason =
  | 'init_blackjack'
  | 'busted'
  | 'blackjack'
  | 'draw'
  | 'biggest';
