import { DatabaseUserThemesSchema } from '../../types/database.js';
import { IdentifiedData } from '../../types/menhera.js';
import Themes from './themes.js';
import { AvailableThemeTypes, ThemeFile, UserBuyableTheme } from './types.js';

const getThemeById = <T extends ThemeFile = ThemeFile>(id: number): IdentifiedData<T> =>
  Object.entries(Themes)
    .filter((a) => Number(a[0]) === id)
    .map((a) => ({ id: Number(a[0]), data: a[1] as T }))[0];

const getThemesByType = <T extends ThemeFile = ThemeFile>(
  themeType: AvailableThemeTypes,
): IdentifiedData<T>[] =>
  Object.entries(Themes)
    .filter((a) => a[1].type === themeType)
    .map((a) => ({ id: Number(a[0]), data: a[1] as T }));

const getUserActiveThemes = (
  userData: DatabaseUserThemesSchema,
): { id: number; inUse: boolean; aquiredAt: number }[] => {
  const allThemes: { id: number; inUse: boolean; aquiredAt: number }[] = [];

  const pushToAllItems = (themes: UserBuyableTheme[], activeTheme: number) =>
    themes.forEach((theme) =>
      allThemes.push({ id: theme.id, inUse: activeTheme === theme.id, aquiredAt: theme.aquiredAt }),
    );

  pushToAllItems(userData.cardsBackgroundThemes, userData.selectedCardBackgroundTheme);
  pushToAllItems(userData.cardsThemes, userData.selectedCardTheme);
  pushToAllItems(userData.profileThemes, userData.selectedProfileTheme);
  pushToAllItems(userData.tableThemes, userData.selectedTableTheme);
  pushToAllItems(userData.ebBackgroundThemes, userData.selectedEbBackgroundTheme);
  pushToAllItems(userData.ebTextBoxThemes, userData.selectedEbTextBoxTheme);
  pushToAllItems(userData.ebMenheraThemes, userData.selectedEbMenheraTheme);

  return allThemes;
};

export { getThemeById, getUserActiveThemes, getThemesByType };
