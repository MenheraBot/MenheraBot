import { Localization } from 'discordeno/types';
import { profileBadges } from '../modules/badges/profileBadges';
import { AvailablePlants, DeliveryMission, Plantation } from '../modules/fazendinha/types';
import { HuntMagicItem } from '../modules/hunt/types';
import { UserBuyableTheme } from '../modules/themes/types';
import { AvailableLanguages, Translation } from './i18next';
import { AvailableActions, InventoryItem, Location } from '../modules/roleplay/types';
import { AbilityID } from '../modules/roleplay/data/abilities';
import { InventoryItemID } from '../modules/roleplay/data/items';
import { DatabaseDaily } from '../modules/dailies/types';

export type ColorResolvable = `#${string}`;

export type UserIdType = string | bigint;

export interface UserColor {
  nome: string;
  cor: `#${string}`;
}

export interface UserBadge {
  id: keyof typeof profileBadges;
  obtainAt: string;
}

export interface DatabaseUserSchema {
  readonly _id: string;
  readonly id: string;
  mamado: number;
  mamou: number;
  married: string | null;
  marriedDate: string | null;
  marriedAt: number | null;
  info: string;
  ban: boolean;
  banReason: string | null;
  bannedSince: string | null;
  selectedColor: ColorResolvable;
  colors: UserColor[];
  demons: number;
  giants: number;
  angels: number;
  archangels: number;
  demigods: number;
  gods: number;
  rolls: number;
  estrelinhas: number;
  votes: number;
  badges: UserBadge[];
  hiddingBadges: Array<UserBadge['id']>;
  titles: UserBuyableTheme[];
  currentTitle: number;
  huntCooldown: number;
  voteCooldown: number;
  trisal: string[];
  inventory: HuntMagicItem[];
  inUseItems: HuntMagicItem[];
  lastCommandAt: number;
  isBot: boolean;
  inactivityWarned: boolean;
  dailies: DatabaseDaily[];
  dailyDayId: number;
  allowMamar: boolean;
  completedDailies: number;
}

export interface DatabaseCreditsSchema {
  themeId: number;
  ownerId: string;
  royalty: number;
  totalEarned: number;
  registeredAt: number;
  timesSold: number;
}

export interface DatabaseProfileImagesSchema {
  imageId: number;
  uploaderId: string;
  name: string;
  totalEarned: number;
  timesSold: number;
  registeredAt: number;
  isPublic: boolean;
  price: number;
}

export interface DatabaseUserThemesSchema {
  readonly id: string;
  cardsThemes: UserBuyableTheme[];
  tableThemes: UserBuyableTheme[];
  profileThemes: UserBuyableTheme[];
  cardsBackgroundThemes: UserBuyableTheme[];
  ebBackgroundThemes: UserBuyableTheme[];
  ebTextBoxThemes: UserBuyableTheme[];
  ebMenheraThemes: UserBuyableTheme[];
  profileImages: UserBuyableTheme[];
  selectedImage: number;
  selectedCardTheme: number;
  selectedTableTheme: number;
  selectedProfileTheme: number;
  selectedCardBackgroundTheme: number;
  selectedEbBackgroundTheme: number;
  selectedEbTextBoxTheme: number;
  selectedEbMenheraTheme: number;
  notifyPurchase: boolean;
  customizedProfile: string[];
}

export interface DatabaseGuildSchema {
  readonly id: string;
  lang: AvailableLanguages;
}

interface MaintenanceInfo {
  commandStructure: string;
  reason: string | null;
}

export interface DatabaseCommandSchema {
  readonly _id: string;
  maintenance: MaintenanceInfo[];
  discordId: string;
}

export type QuantitativeSeed = {
  amount: number;
  plant: AvailablePlants;
};

export type QuantitativePlant = {
  amount?: number;
  plant: AvailablePlants;
  weight: number;
};

export interface DatabaseTitlesSchema {
  titleId: number;
  text: string;
  textLocalizations: Localization | null;
  registeredAt: number;
}

export interface DatabaseFeirinhaSchema {
  _id: string;
  userId: string;
  plantType: AvailablePlants;
  weight: number;
  price: number;
  [`name_pt-BR`]: string;
  [`name_en-US`]: string;
}

export interface DatabaseFarmerSchema {
  readonly id: string;
  plantations: Plantation[];
  seeds: QuantitativeSeed[];
  silo: QuantitativePlant[];
  siloUpgrades: number;
  experience: number;
  lastPlantedSeed: AvailablePlants;
  dailies: DeliveryMission[];
  dailyDayId: number;
}

type DatabaseUserAbility = {
  id: AbilityID;
  proficience: number;
};

interface Equipment {
  id: InventoryItemID;
  duration: number;
}

export interface DatabaseCharacterSchema {
  readonly id: string;
  life: number;
  energy: number;
  inventory: InventoryItem[];
  abilities: DatabaseUserAbility[];
  location: Location;
  currentAction: AvailableActions;
  money: number;
  equipment: Equipment[];
}

export interface DatabaseNotificationSchema {
  readonly _id: string;
  userId: string;
  translationKey: Translation;
  translationValues?: Record<string, unknown>;
  createdAt: number;
  unread: boolean;
}

export interface DatabaseSuggestionLimitSchema {
  id: string;
  limited: boolean;
  limitedAt: number;
  suggestion: string;
}
