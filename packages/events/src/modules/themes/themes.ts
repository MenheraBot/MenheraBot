/* eslint-disable @typescript-eslint/ban-types */
import { ThemeFile } from './types';

const Themes: { [id: number]: ThemeFile } & Object = {
  1: {
    price: 100_000,
    type: 'table',
    theme: 'blue',
  },
  2: {
    price: 200_000,
    theme: 'upsidedown',
    type: 'profile',
    colorCompatible: true,
    imageCompatible: false,
  },
  3: {
    price: 0,
    theme: 'default',
    type: 'profile',
    colorCompatible: true,
    imageCompatible: false,
  },
  4: {
    price: 0,
    theme: 'default',
    type: 'cards',
  },
  5: {
    price: 0,
    theme: 'green',
    type: 'table',
  },
  6: {
    price: 0,
    theme: 'red',
    type: 'card_background',
  },
  7: {
    price: 666_666,
    theme: 'death',
    type: 'cards',
  },
  8: {
    price: 60_000,
    theme: 'blue',
    type: 'card_background',
  },
  9: {
    price: 70_000,
    theme: 'cute_menhera',
    type: 'card_background',
  },
  10: {
    price: 90_000,
    theme: 'premium',
    type: 'card_background',
  },
  11: {
    price: 100_000,
    theme: 'red',
    type: 'table',
  },
  12: {
    price: 120_000,
    theme: 'pink',
    type: 'table',
  },
  13: {
    price: 150_000,
    theme: 'rounded',
    type: 'table',
  },
  14: {
    price: 250_000,
    type: 'profile',
    theme: 'christmas_2021',
    colorCompatible: true,
    imageCompatible: true,
    customEdits: ['useImage'],
  },
  15: {
    price: 240_000,
    type: 'profile',
    theme: 'warrior',
    colorCompatible: true,
    imageCompatible: true,
    customEdits: ['useImage'],
  },
  16: {
    price: 240_000,
    type: 'profile',
    theme: 'fortification',
    colorCompatible: true,
    imageCompatible: true,
    customEdits: ['useImage'],
  },
  17: {
    price: 190_000,
    type: 'profile',
    theme: 'kawaii',
    colorCompatible: true,
    imageCompatible: false,
  },
  18: {
    price: 90_000,
    theme: 'kawaii',
    type: 'card_background',
  },
  19: {
    price: 170_000,
    type: 'table',
    theme: 'gauderios',
  },
  20: {
    price: 100_000,
    type: 'card_background',
    theme: 'lamenta_caelorum',
  },
  21: {
    price: 390_000,
    theme: 'without_soul',
    type: 'profile',
    colorCompatible: true,
    imageCompatible: false,
  },
  22: {
    price: 350_000,
    theme: 'id03',
    type: 'profile',
    colorCompatible: true,
    imageCompatible: false,
  },
  23: {
    price: 200_000,
    theme: 'atemporal',
    type: 'table',
  },
  24: {
    price: 250_000,
    type: 'profile',
    theme: 'gatito',
    colorCompatible: false,
    imageCompatible: false,
  },
  25: {
    price: 0,
    type: 'eb_background',
    theme: 'default',
  },
  26: {
    price: 0,
    type: 'eb_text_box',
    theme: 'default',
  },
  27: {
    price: 0,
    type: 'eb_menhera',
    theme: 'default',
  },
  28: {
    price: 50_000,
    type: 'eb_text_box',
    theme: 'xp',
  },
  29: {
    price: 75_000,
    type: 'eb_background',
    theme: 'xp',
  },
  30: {
    price: 175_000,
    type: 'profile',
    theme: 'mural',
    colorCompatible: true,
    imageCompatible: true,
    customEdits: ['textBoxFilled', 'whiteUpperText', 'whiteBottomText'],
  },
  31: {
    price: 260_000,
    type: 'profile',
    theme: 'hello_kitty',
    colorCompatible: false,
    imageCompatible: false,
  },
  32: {
    price: 550_001,
    type: 'cards',
    theme: 'hello_kitty',
  },
  33: {
    price: 210_000,
    type: 'table',
    theme: 'hello_kitty',
  },
  34: {
    price: 120_000,
    type: 'card_background',
    theme: 'hello_kitty',
  },
  35: {
    price: 80_000,
    type: 'eb_text_box',
    theme: 'hello_kitty',
  },
  36: {
    price: 300_000,
    type: 'eb_menhera',
    theme: 'hello_kitty',
  },
  37: {
    price: 85_000,
    type: 'eb_background',
    theme: 'hello_kitty',
  },
};

export default Themes;
