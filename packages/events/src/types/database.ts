import { profileBadges } from '../modules/badges/profileBadges';
import { AvailablePlants, Plantation } from '../modules/fazendinha/types';
import { HuntMagicItem } from '../modules/hunt/types';
import { UserBuyableTheme } from '../modules/themes/types';

export type ColorResolvable = `#${string}`;

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
  huntCooldown: number;
  voteCooldown: number;
  trisal: string[];
  inventory: HuntMagicItem[];
  inUseItems: HuntMagicItem[];
  lastCommandAt: number;
  isBot: boolean;
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
  lang: string;
}
export interface DatabaseCommandSchema {
  readonly _id: string;
  maintenance: boolean;
  maintenanceReason: string | null;
  discordId: string;
}

type QuantativePlant = {
  amount: number;
  plant: AvailablePlants;
};

export interface DatabaseFarmerSchema {
  readonly id: string;
  plantations: Plantation[];
  seeds: QuantativePlant[];
  silo: QuantativePlant[];
}

export type UserIdType = string | bigint;
