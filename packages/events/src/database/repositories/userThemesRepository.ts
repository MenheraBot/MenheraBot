import { BigString } from 'discordeno/types';

import { getThemeById } from '../../modules/themes/getThemes';
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
import { DatabaseUserThemesSchema } from '../../types/database';
import { debugError } from '../../utils/debugError';
import { userThemesModel } from '../collections';
import { MainRedisClient } from '../databases';
import { registerCacheStatus } from '../../structures/initializePrometheus';

const parseMongoUserToRedisUser = (user: DatabaseUserThemesSchema): DatabaseUserThemesSchema => ({
  id: `${user.id}`,
  cardsThemes: user.cardsThemes,
  tableThemes: user.tableThemes,
  profileThemes: user.profileThemes,
  cardsBackgroundThemes: user.cardsBackgroundThemes,
  ebBackgroundThemes: user.ebBackgroundThemes,
  ebTextBoxThemes: user.ebTextBoxThemes,
  ebMenheraThemes: user.ebMenheraThemes,
  profileImages: user.profileImages,
  selectedImage: user.selectedImage,
  selectedCardTheme: user.selectedCardTheme,
  selectedTableTheme: user.selectedTableTheme,
  selectedProfileTheme: user.selectedProfileTheme,
  selectedCardBackgroundTheme: user.selectedCardBackgroundTheme,
  selectedEbBackgroundTheme: user.selectedEbBackgroundTheme,
  selectedEbTextBoxTheme: user.selectedEbTextBoxTheme,
  selectedEbMenheraTheme: user.selectedEbMenheraTheme,
  notifyPurchase: user.notifyPurchase,
  customizedProfile: user.customizedProfile,
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
  | 'profileImages'
>;

export type UserSelectedThemeTypes = keyof Pick<
  DatabaseUserThemesSchema,
  | 'selectedTableTheme'
  | 'selectedCardTheme'
  | 'selectedCardBackgroundTheme'
  | 'selectedProfileTheme'
  | 'selectedEbBackgroundTheme'
  | 'selectedEbTextBoxTheme'
  | 'selectedEbMenheraTheme'
  | 'selectedImage'
>;

const findEnsuredUserThemes = async (userId: BigString): Promise<DatabaseUserThemesSchema> => {
  const fromRedis = await MainRedisClient.get(`user_themes:${userId}`).catch(debugError);

  registerCacheStatus(fromRedis, 'user_themes');

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await userThemesModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) {
    const newUser = await userThemesModel.create({ id: userId });

    await MainRedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  await MainRedisClient.setex(
    `user_themes:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const getThemesForBlackjack = async (
  userId: BigString,
): Promise<[AvailableTableThemes, AvailableCardThemes, AvailableCardBackgroundThemes]> => {
  const userThemes = await findEnsuredUserThemes(userId);

  const tableTheme = getThemeById<TableTheme>(userThemes.selectedTableTheme).data.theme;
  const cardTheme = getThemeById<CardsTheme>(userThemes.selectedCardTheme).data.theme;
  const backgroundCardTheme = getThemeById<CardBackgroundTheme>(
    userThemes.selectedCardBackgroundTheme,
  ).data.theme;

  return [tableTheme, cardTheme, backgroundCardTheme];
};

const getThemesForPoker = async (
  userId: BigString,
): Promise<[AvailableCardThemes, AvailableCardBackgroundThemes]> => {
  const userThemes = await findEnsuredUserThemes(userId);

  const cardTheme = getThemeById<CardsTheme>(userThemes.selectedCardTheme).data.theme;
  const backgroundCardTheme = getThemeById<CardBackgroundTheme>(
    userThemes.selectedCardBackgroundTheme,
  ).data.theme;

  return [cardTheme, backgroundCardTheme];
};

const getThemesForEightBall = async (
  userId: BigString,
): Promise<
  [
    AvailableEightBallBackgroundThemeTypes,
    AvailableEightBallTextBoxThemeTypes,
    AvailableEightBallMennheraThemeTypes,
  ]
> => {
  const userThemes = await findEnsuredUserThemes(userId);

  const backgroundTheme = getThemeById<EightBallBackgroundTheme>(
    userThemes.selectedEbBackgroundTheme,
  ).data.theme;
  const textBoxTheme = getThemeById<EightBallTextBoxTheme>(userThemes.selectedEbTextBoxTheme).data
    .theme;
  const menheraTheme = getThemeById<EightBallMenheraTheme>(userThemes.selectedEbMenheraTheme).data
    .theme;

  return [backgroundTheme, textBoxTheme, menheraTheme];
};

const makeNotify = async (userId: BigString, notify: boolean): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { notifyPurchase: notify });
  await MainRedisClient.del(`user_themes:${userId}`);
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
    await MainRedisClient.setex(
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

const addProfileImage = async (userId: BigString, imageId: number): Promise<void> => {
  await addThemeToUserAccount(userId, 'profileImages', imageId);
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

  const fromRedis = await MainRedisClient.get(`user_themes:${userId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
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

const setProfileImage = async (userId: BigString, imageId: number): Promise<void> => {
  await setThemeToUserAccount(userId, 'selectedImage', imageId);
};

const setCustomizedProfile = async (userId: BigString, custom: string[]): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { customizedProfile: custom });
  await MainRedisClient.del(`user_themes:${userId}`);
};

export default {
  findEnsuredUserThemes,
  getThemesForBlackjack,
  getThemesForEightBall,
  makeNotify,
  addTableTheme,
  addCardsTheme,
  addCardBackgroundTheme,
  addProfileTheme,
  setCustomizedProfile,
  setProfileImage,
  addEbBackgroundTheme,
  addEbTextBoxTheme,
  addEbMenheraTheme,
  getThemesForPoker,
  getTableTheme,
  getCardsTheme,
  getCardBackgroundTheme,
  getProfileTheme,
  getEbBackgroundTheme,
  getEbTextBoxTheme,
  setThemeToUserAccount,
  getEbMenheraTheme,
  addProfileImage,
  setTableTheme,
  setCardBackgroundTheme,
  setProfileTheme,
  setCardsTheme,
  setEbBackgroundTheme,
  setEbTextBoxTheme,
  setEbMenheraTheme,
};
