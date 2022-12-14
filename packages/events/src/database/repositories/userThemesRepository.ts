import { BigString } from 'discordeno/types';

import { getThemeById } from '../../modules/themes/getThemes';
import { RedisClient } from '../databases';
import { DatabaseUserThemesSchema } from '../../types/database';
import { debugError } from '../../utils/debugError';
import { userThemesModel } from '../collections';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableEightBallBackgroundThemeTypes,
  AvailableEightBallMennheraThemeTypes,
  AvailableEightBallTextBoxThemeTypes,
  AvailableProfilesThemes,
  AvailableTableThemes,
  CardBackgroundTheme,
  CardsTheme,
  EightBallBackgroundTheme,
  EightBallMenheraTheme,
  EightBallTextBoxTheme,
  ProfileTheme,
  TableTheme,
  ThemeFile,
} from '../../modules/themes/types';

const parseMongoUserToRedisUser = (user: DatabaseUserThemesSchema): DatabaseUserThemesSchema => ({
  id: `${user.id}`,
  cardsThemes: user.cardsThemes,
  tableThemes: user.tableThemes,
  profileThemes: user.profileThemes,
  cardsBackgroundThemes: user.cardsBackgroundThemes,
  ebBackgroundThemes: user.ebBackgroundThemes,
  ebTextBoxThemes: user.ebTextBoxThemes,
  ebMenheraThemes: user.ebMenheraThemes,
  selectedCardTheme: user.selectedCardTheme,
  selectedTableTheme: user.selectedTableTheme,
  selectedProfileTheme: user.selectedProfileTheme,
  selectedCardBackgroundTheme: user.selectedCardBackgroundTheme,
  selectedEbBackgroundTheme: user.selectedEbMenheraTheme,
  selectedEbTextBoxTheme: user.selectedEbTextBoxTheme,
  selectedEbMenheraTheme: user.selectedEbMenheraTheme,
  notifyPurchase: user.notifyPurchase,
});

type UserThemeArrayTypes = keyof Pick<
  DatabaseUserThemesSchema,
  | 'tableThemes'
  | 'cardsThemes'
  | 'cardsBackgroundThemes'
  | 'profileThemes'
  | 'ebBackgroundThemes'
  | 'ebTextBoxThemes'
  | 'ebMenheraThemes'
>;

type UserSelectedThemeTypes = keyof Pick<
  DatabaseUserThemesSchema,
  | 'selectedTableTheme'
  | 'selectedCardTheme'
  | 'selectedCardBackgroundTheme'
  | 'selectedProfileTheme'
  | 'selectedEbBackgroundTheme'
  | 'selectedEbTextBoxTheme'
  | 'selectedEbMenheraTheme'
>;

const findEnsuredUserThemes = async (userId: BigString): Promise<DatabaseUserThemesSchema> => {
  const fromRedis = await RedisClient.get(`user_themes:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await userThemesModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) {
    const newUser = await userThemesModel.create({ id: userId });

    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  await RedisClient.setex(
    `user_themes:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const getThemesForBlackjack = async (
  userId: BigString,
): Promise<[AvailableTableThemes, AvailableCardThemes, AvailableCardBackgroundThemes]> => {
  const themes = await findEnsuredUserThemes(userId);

  const tableTheme = getThemeById<TableTheme>(themes.selectedTableTheme).data.theme;
  const cardTheme = getThemeById<CardsTheme>(themes.selectedCardTheme).data.theme;
  const backgroundCardTheme = getThemeById<CardBackgroundTheme>(themes.selectedCardBackgroundTheme)
    .data.theme;

  return [tableTheme, cardTheme, backgroundCardTheme];
};

const makeNotify = async (userId: BigString, notify: boolean): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { notifyPurchase: notify });
};

const addThemeToUserAccount = async (
  userId: BigString,
  themeType: UserThemeArrayTypes,
  themeId: number,
): Promise<void> => {
  const updatedUser = await userThemesModel
    .findOneAndUpdate(
      { id: userId },
      { $push: { [themeType]: { id: themeId, aquiredAt: Date.now() } } },
      { new: true },
    )
    .catch(() => null);

  if (updatedUser) {
    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
  }
};

const addTableTheme = async (userId: BigString, tableId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'tableThemes', tableId);
};

const addCardsTheme = async (userId: BigString, cardId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'cardsThemes', cardId);
};

const addCardBackgroundTheme = async (userId: BigString, backgroundId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'cardsBackgroundThemes', backgroundId);
};

const addProfileTheme = async (userId: BigString, profileId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'profileThemes', profileId);
};

const addEbBackgroundTheme = async (userId: BigString, backgroundId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'ebBackgroundThemes', backgroundId);
};

const addEbTextBoxTheme = async (userId: BigString, textBoxId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'ebTextBoxThemes', textBoxId);
};

const addEbMenheraTheme = async (userId: BigString, menheraId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'ebMenheraThemes', menheraId);
};

const getThemeFromUserAccount = async <T extends ThemeFile>(
  userId: BigString,
  themeType: UserSelectedThemeTypes,
): Promise<T['theme']> => {
  const userThemes = await findEnsuredUserThemes(userId);

  return getThemeById<T>(userThemes[themeType]).data.theme;
};

const getTableTheme = async (userId: BigString): Promise<AvailableTableThemes> =>
  getThemeFromUserAccount<TableTheme>(userId, 'selectedTableTheme');

const getCardsTheme = async (userId: BigString): Promise<AvailableCardThemes> =>
  getThemeFromUserAccount<CardsTheme>(userId, 'selectedCardTheme');

const getProfileTheme = async (userId: BigString): Promise<AvailableProfilesThemes> =>
  getThemeFromUserAccount<ProfileTheme>(userId, 'selectedProfileTheme');

const getCardBackgroundTheme = async (userId: BigString): Promise<AvailableCardBackgroundThemes> =>
  getThemeFromUserAccount<CardBackgroundTheme>(userId, 'selectedCardBackgroundTheme');

const getEbBackgroundTheme = async (
  userId: BigString,
): Promise<AvailableEightBallBackgroundThemeTypes> =>
  getThemeFromUserAccount<EightBallBackgroundTheme>(userId, 'selectedEbBackgroundTheme');

const getEbTextBoxTheme = async (userId: BigString): Promise<AvailableEightBallTextBoxThemeTypes> =>
  getThemeFromUserAccount<EightBallTextBoxTheme>(userId, 'selectedEbTextBoxTheme');

const getEbMenheraTheme = async (
  userId: BigString,
): Promise<AvailableEightBallMennheraThemeTypes> =>
  getThemeFromUserAccount<EightBallMenheraTheme>(userId, 'selectedEbMenheraTheme');

const setThemeToUserAccount = async (
  userId: BigString,
  themeType: UserSelectedThemeTypes,
  themeId: number,
): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { [themeType]: themeId });

  const fromRedis = await RedisClient.get(`user_themes:${userId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, [themeType]: themeId })),
    );
  }
};

const setCardsTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedCardTheme', themeId);
};

const setCardBackgroundTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedCardBackgroundTheme', themeId);
};

const setProfileTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedProfileTheme', themeId);
};

const setTableTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedTableTheme', themeId);
};

const setEbBackgroundTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedEbBackgroundTheme', themeId);
};

const setEbTextBoxTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedEbTextBoxTheme', themeId);
};

const setEbMenheraTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedEbMenheraTheme', themeId);
};

export default {
  findEnsuredUserThemes,
  getThemesForBlackjack,
  makeNotify,
  addTableTheme,
  addCardsTheme,
  addCardBackgroundTheme,
  addProfileTheme,
  addEbBackgroundTheme,
  addEbTextBoxTheme,
  addEbMenheraTheme,
  getTableTheme,
  getCardsTheme,
  getCardBackgroundTheme,
  getProfileTheme,
  getEbBackgroundTheme,
  getEbTextBoxTheme,
  getEbMenheraTheme,
  setTableTheme,
  setCardBackgroundTheme,
  setProfileTheme,
  setCardsTheme,
  setEbBackgroundTheme,
  setEbTextBoxTheme,
  setEbMenheraTheme,
};
