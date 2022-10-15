import { IdentifiedData } from '../../types/menhera';
import Themes from './themes';
import { ThemeFile } from './types';

const getThemeById = <T extends ThemeFile = ThemeFile>(id: number): IdentifiedData<T> =>
  Object.entries(Themes)
    .filter((a) => Number(a[0]) === id)
    .map((a) => ({ id: Number(a[0]), data: a[1] }))[0];

export { getThemeById };
