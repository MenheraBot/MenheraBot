/* eslint-disable @typescript-eslint/ban-types */
import { ThemeFiles } from '@utils/Types';

const ImageThemes: { [id: number]: ThemeFiles } & Object = {
  1: {
    isBuyable: true,
    price: 300_000,
    rarity: 'common',
    type: 'table',
    theme: 'blue',
  },
  2: {
    isBuyable: true,
    price: 700_000,
    rarity: 'rare',
    theme: 'upsidedown',
    type: 'profile',
  },
  3: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'default',
    type: 'profile',
  },
  4: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'default',
    type: 'cards',
  },
  5: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'green',
    type: 'table',
  },
  6: {
    isBuyable: false,
    price: 0,
    rarity: 'common',
    theme: 'red',
    type: 'card_background',
  },
  7: {
    isBuyable: true,
    price: 3_000_000,
    rarity: 'legendary',
    theme: 'death',
    type: 'cards',
  },
  8: {
    isBuyable: true,
    price: 100_000,
    rarity: 'common',
    theme: 'blue',
    type: 'card_background',
  },
  9: {
    isBuyable: true,
    price: 250_000,
    rarity: 'rare',
    theme: 'cute_menhera',
    type: 'card_background',
  },
  10: {
    isBuyable: true,
    price: 680_000,
    rarity: 'epic',
    theme: 'premium',
    type: 'card_background',
  },
  11: {
    isBuyable: true,
    price: 300_000,
    rarity: 'common',
    theme: 'red',
    type: 'table',
  },
  12: {
    isBuyable: true,
    price: 380_000,
    rarity: 'common',
    theme: 'pink',
    type: 'table',
  },
  13: {
    isBuyable: true,
    price: 500_000,
    rarity: 'rare',
    theme: 'rounded',
    type: 'table',
  },
};

export default ImageThemes;
