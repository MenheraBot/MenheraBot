export type AvailableCardThemes = 'default' | 'death' | 'hello_kitty' | 'night';

export type AvailableCardBackgroundThemes =
  | 'red'
  | 'blue'
  | 'cute_menhera'
  | 'premium'
  | 'kawaii'
  | 'hello_kitty'
  | 'nocturnal'
  | 'morning'
  | 'frostbite'
  | 'berserk'
  | 'sunflower'
  | 'hes_looking'
  | 'lamenta_caelorum';

export type AvailableTableThemes =
  | 'green'
  | 'blue'
  | 'berserk'
  | 'red'
  | 'pink'
  | 'rounded'
  | 'gauderios'
  | 'hello_kitty'
  | 'atemporal';

export type AvailableProfilesThemes =
  | 'default'
  | 'upsidedown'
  | 'kawaii'
  | 'christmas_2021'
  | 'warrior'
  | 'fortification'
  | 'without_soul'
  | 'sunflower'
  | 'gallery'
  | 'id03'
  | 'gatito'
  | 'hello_kitty'
  | 'mural'
  | 'website'
  | 'memories'
  | 'frozen'
  | 'berserk'
  | 'comuna_patrio';

export type AvailableThemeTypes =
  | 'profile'
  | 'cards'
  | 'card_background'
  | 'table'
  | 'eb_background'
  | 'eb_text_box'
  | 'eb_menhera';

export type AvailableEightBallBackgroundThemeTypes = 'default' | 'xp' | 'hello_kitty';

export type AvailableEightBallTextBoxThemeTypes = 'default' | 'xp' | 'hello_kitty';

export type AvailableEightBallMennheraThemeTypes = 'default' | 'hello_kitty';

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
  colorCompatible: boolean;
  imageCompatible: boolean;
  needApiData: boolean;
  customEdits?: string[];
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
  theme: AvailableEightBallBackgroundThemeTypes;
}

export interface EightBallTextBoxTheme extends BaseTheme {
  type: 'eb_text_box';
  theme: AvailableEightBallTextBoxThemeTypes;
}

export interface EightBallMenheraTheme extends BaseTheme {
  type: 'eb_menhera';
  theme: AvailableEightBallMennheraThemeTypes;
}

export type ThemeFile =
  | ProfileTheme
  | CardsTheme
  | TableTheme
  | CardBackgroundTheme
  | EightBallTextBoxTheme
  | EightBallMenheraTheme
  | EightBallBackgroundTheme;
