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

export interface UserBuyableTheme {
  id: number;
  aquiredAt: number;
}

export type ThemeRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythical' | 'divine';

export interface BaseTheme {
  price: number;
  rarity: ThemeRarity;
  isBuyable: boolean;
}

export interface CardBackgroundTheme extends BaseTheme {
  type: 'card_background';
  theme: AvailableCardBackgroundThemes;
}

export interface ProfileTheme extends BaseTheme {
  type: 'profile';
  theme: AvailableProfilesThemes;
}

export interface CardsTheme extends BaseTheme {
  type: 'cards';
  theme: AvailableCardThemes;
}
export interface TableTheme extends BaseTheme {
  type: 'table';
  theme: AvailableTableThemes;
}

export type ThemeFile = IProfileTheme | ICardsTheme | ITableTheme | ICardBackgroudTheme;
