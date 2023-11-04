import { TaxedGameLimts } from '../../utils/taxesUtils';

export const ROULETTE_NUMBERS: {
  value: number;
  color: 'red' | 'green' | 'black';
  parity: 'odd' | 'even' | '?';
  size: '?' | 'low' | 'high';
  dozen: 'first' | 'second' | 'third' | '?';
}[] = [
  { value: 0, color: 'green', parity: '?', size: '?', dozen: '?' },
  { value: 1, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 2, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 3, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 4, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 5, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 6, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 7, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 8, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 9, color: 'red', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 10, color: 'black', parity: 'even', size: 'low', dozen: 'first' },
  { value: 11, color: 'black', parity: 'odd', size: 'low', dozen: 'first' },
  { value: 12, color: 'red', parity: 'even', size: 'low', dozen: 'first' },
  { value: 13, color: 'black', parity: 'odd', size: 'low', dozen: 'second' },
  { value: 14, color: 'red', parity: 'even', size: 'low', dozen: 'second' },
  { value: 15, color: 'black', parity: 'odd', size: 'low', dozen: 'second' },
  { value: 16, color: 'red', parity: 'even', size: 'low', dozen: 'second' },
  { value: 17, color: 'black', parity: 'odd', size: 'low', dozen: 'second' },
  { value: 18, color: 'red', parity: 'even', size: 'low', dozen: 'second' },
  { value: 19, color: 'red', parity: 'odd', size: 'high', dozen: 'second' },
  { value: 20, color: 'black', parity: 'even', size: 'high', dozen: 'second' },
  { value: 21, color: 'red', parity: 'odd', size: 'high', dozen: 'second' },
  { value: 22, color: 'black', parity: 'even', size: 'high', dozen: 'second' },
  { value: 23, color: 'red', parity: 'odd', size: 'high', dozen: 'second' },
  { value: 24, color: 'black', parity: 'even', size: 'high', dozen: 'second' },
  { value: 25, color: 'red', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 26, color: 'black', parity: 'even', size: 'high', dozen: 'third' },
  { value: 27, color: 'red', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 28, color: 'black', parity: 'even', size: 'high', dozen: 'third' },
  { value: 29, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 30, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
  { value: 31, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 32, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
  { value: 33, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 34, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
  { value: 35, color: 'black', parity: 'odd', size: 'high', dozen: 'third' },
  { value: 36, color: 'red', parity: 'even', size: 'high', dozen: 'third' },
];

export const ROULETTE_LIMITS = {
  MAX_LIMIT: 75_000,
  MIN_LIMIT: 10,
  MIN_TAX: 3.8 / 100,
  MAX_TAX: 25 / 100,
} satisfies TaxedGameLimts;

export const WIN_MULTIPLIERS = {
  STRAIGHT: 9,
  SPLIT: 5,
  DOZENS: 2,
  COLOR: 1,
  ODDEVEN: 1,
  LOWHIGH: 1,
};
