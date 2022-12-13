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
  | 'id03'
  | 'gatito';

export type AvailableThemeTypes =
  | 'profile'
  | 'cards'
  | 'card_background'
  | 'table'
  | 'eb_background'
  | 'eb_text_box'
  | 'eb_menhera';

export type EightBallAvailableBackgroundThemeTypes = 'default' | 'xp';

export type EightBallAvailableTextBoxThemeTypes = 'default' | 'xp';

export type EightBallAvailableMennheraThemeTypes = 'default';

export interface UserBuyableTheme {
  id: number;
  aquiredAt: number;
}

export interface BaseTheme {
  price: number;
  type: AvailableThemeTypes;
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

export interface EightBallBackgroundTheme extends BaseTheme {
  type: 'eb_background';
  theme: EightBallAvailableBackgroundThemeTypes;
}

export interface EightBallTextBoxTheme extends BaseTheme {
  type: 'eb_text_box';
  theme: EightBallAvailableTextBoxThemeTypes;
}

export interface EightBallMenheraTheme extends BaseTheme {
  type: 'eb_menhera';
  theme: EightBallAvailableMennheraThemeTypes;
}

export type ThemeFile =
  | ProfileTheme
  | CardsTheme
  | TableTheme
  | CardBackgroundTheme
  | EightBallTextBoxTheme
  | EightBallMenheraTheme
  | EightBallBackgroundTheme;
