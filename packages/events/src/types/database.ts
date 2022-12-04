import { profileBadges } from '../modules/badges/profileBadges';
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
  itemsLimit: number;
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

export interface DatabaseUserThemesSchema {
  readonly id: string;
  cardsThemes: Array<UserBuyableTheme>;
  tableThemes: Array<UserBuyableTheme>;
  profileThemes: Array<UserBuyableTheme>;
  cardsBackgroundThemes: Array<UserBuyableTheme>;
  selectedCardTheme: number;
  selectedTableTheme: number;
  selectedProfileTheme: number;
  selectedCardBackgroundTheme: number;
  notifyPurchase: boolean;
}

export interface DatabaseGuildSchema {
  readonly id: string;
  lang: string;
}
export interface DatabaseCommandMaintenanceSchema {
  readonly _id: string;
  maintenance: boolean;
  maintenanceReason: string | null;
}

export type UserIdType = string | bigint;
