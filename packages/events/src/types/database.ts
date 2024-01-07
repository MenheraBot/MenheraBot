import { Localization } from 'discordeno/types';
import { profileBadges } from '../modules/badges/profileBadges';
import { AvailablePlants, DeliveryMission, Plantation } from '../modules/fazendinha/types';
import { HuntMagicItem } from '../modules/hunt/types';
import { UserBuyableTheme } from '../modules/themes/types';
import { AvailableLanguages } from './i18next';

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

export type QuantitativePlant = {
  amount: number;
  plant: AvailablePlants;
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
  amount: number;
  price: number;
  [`name_pt-BR`]: string;
  [`name_en-US`]: string;
}

export interface DatabaseFarmerSchema {
  readonly id: string;
  plantations: Plantation[];
  seeds: QuantitativePlant[];
  silo: QuantitativePlant[];
  siloUpgrades: number;
  biggestSeed: number;
  plantedFields: number;
  experience: number;
  lastPlantedSeed: AvailablePlants;
  dailies: DeliveryMission[];
  dailyDayId: number;
}

export interface DatabaseCharacterSchema {
  readonly id: string;
  life: number;
  energy: number;
}
