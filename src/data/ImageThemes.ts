/* eslint-disable @typescript-eslint/ban-types */
import { ThemeFiles } from '@utils/Types';

const ImageThemes: { [id: number]: ThemeFiles } & Object = {
  1: {
    isBuyable: true,
    price: 350_000,
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
};

export default ImageThemes;
