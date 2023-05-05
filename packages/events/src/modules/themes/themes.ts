/* eslint-disable @typescript-eslint/ban-types */
import { ThemeFile } from './types';

const Themes: { [id: number]: ThemeFile } & Object = {
  1: {
    price: 70_000,
    type: 'table',
    theme: 'blue',
  },
  2: {
    price: 130_000,
    theme: 'upsidedown',
    type: 'profile',
  },
  3: {
    price: 0,
    theme: 'default',
    type: 'profile',
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
    price: 500_000,
    theme: 'death',
    type: 'cards',
  },
  8: {
    price: 60_000,
    theme: 'blue',
    type: 'card_background',
  },
  9: {
    price: 110_000,
    theme: 'cute_menhera',
    type: 'card_background',
  },
  10: {
    price: 230_000,
    theme: 'premium',
    type: 'card_background',
  },
  11: {
    price: 60_000,
    theme: 'red',
    type: 'table',
  },
  12: {
    price: 75_321,
    theme: 'pink',
    type: 'table',
  },
  13: {
    price: 90_000,
    theme: 'rounded',
    type: 'table',
  },
  14: {
    price: 230_000,
    type: 'profile',
    theme: 'christmas_2021',
  },
  15: {
    price: 180_000,
    type: 'profile',
    theme: 'warrior',
  },
  16: {
    price: 190_000,
    type: 'profile',
    theme: 'fortification',
  },
  17: {
    price: 120_000,
    type: 'profile',
    theme: 'kawaii',
  },
  18: {
    price: 60_000,
    theme: 'kawaii',
    type: 'card_background',
  },
  19: {
    price: 100_000,
    type: 'table',
    theme: 'gauderios',
  },
  20: {
    price: 200_001,
    type: 'card_background',
    theme: 'lamenta_caelorum',
  },
  21: {
    price: 453_342,
    theme: 'without_soul',
    type: 'profile',
  },
  22: {
    price: 250_000,
    theme: 'id03',
    type: 'profile',
  },
  23: {
    price: 103_030,
    theme: 'atemporal',
    type: 'table',
  },
  24: {
    price: 190_010,
    type: 'profile',
    theme: 'gatito',
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
    price: 40_000,
    type: 'eb_text_box',
    theme: 'xp',
  },
  29: {
    price: 50_000,
    type: 'eb_background',
    theme: 'xp',
  },
};

export default Themes;
