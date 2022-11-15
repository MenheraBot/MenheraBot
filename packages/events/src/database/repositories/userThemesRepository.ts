import { BigString } from 'discordeno/types';

import { getThemeById } from '../../modules/themes/getThemes';
import { RedisClient } from '../databases';
import { DatabaseUserThemesSchema } from '../../types/database';
import { debugError } from '../../utils/debugError';
import { userThemesModel } from '../collections';
import {
  AvailableCardBackgroundThemes,
  AvailableCardThemes,
  AvailableProfilesThemes,
  AvailableTableThemes,
  CardBackgroundTheme,
  CardsTheme,
  ProfileTheme,
  TableTheme,
} from '../../modules/themes/types';

const parseMongoUserToRedisUser = (user: DatabaseUserThemesSchema): DatabaseUserThemesSchema => ({
  id: `${user.id}`,
  cardsThemes: user.cardsThemes,
  tableThemes: user.tableThemes,
  profileThemes: user.profileThemes,
  cardsBackgroundThemes: user.cardsBackgroundThemes,
  selectedCardTheme: user.selectedCardTheme,
  selectedTableTheme: user.selectedTableTheme,
  selectedProfileTheme: user.selectedProfileTheme,
  selectedCardBackgroundTheme: user.selectedCardBackgroundTheme,
  notifyPurchase: user.notifyPurchase,
});

type AcceptedThemeTypes = 'tableThemes' | 'cardsThemes' | 'cardsBackgroundThemes' | 'profileThemes';

const addThemeToUserAccount = async (
  userId: BigString,
  themeType: AcceptedThemeTypes,
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

const getTableTheme = async (userId: BigString): Promise<AvailableTableThemes> => {
  const themes = await findEnsuredUserThemes(userId);

  return getThemeById<TableTheme>(themes.selectedTableTheme).data.theme;
};

const getCardsTheme = async (userId: BigString): Promise<AvailableCardThemes> => {
  const themes = await findEnsuredUserThemes(userId);

  return getThemeById<CardsTheme>(themes.selectedCardTheme).data.theme;
};

const getProfileTheme = async (userId: BigString): Promise<AvailableProfilesThemes> => {
  const themes = await findEnsuredUserThemes(userId);

  return getThemeById<ProfileTheme>(themes.selectedProfileTheme).data.theme;
};

const getCardBackgroundTheme = async (
  userId: BigString,
): Promise<AvailableCardBackgroundThemes> => {
  const themes = await findEnsuredUserThemes(userId);

  return getThemeById<CardBackgroundTheme>(themes.selectedCardBackgroundTheme).data.theme;
};

const makeNotify = async (userId: BigString, notify: boolean): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { notifyPurchase: notify });
};

const setCardsTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { selectedCardTheme: themeId });

  const fromRedis = await RedisClient.get(`user_themes:${userId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, selectedCardTheme: themeId })),
    );
  }
};

const setCardBackgroundTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { selectedCardBackgroundTheme: themeId });

  const fromRedis = await RedisClient.get(`user_themes:${userId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, selectedCardBackgroundTheme: themeId })),
    );
  }
};

const setProfileTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { selectedProfileTheme: themeId });

  const fromRedis = await RedisClient.get(`user_themes:${userId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, selectedProfileTheme: themeId })),
    );
  }
};

const setTableTheme = async (userId: BigString, themeId: number): Promise<void> => {
  await userThemesModel.updateOne({ id: `${userId}` }, { selectedTableTheme: themeId });

  const fromRedis = await RedisClient.get(`user_themes:${userId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await RedisClient.setex(
      `user_themes:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, selectedTableTheme: themeId })),
    );
  }
};

export default {
  findEnsuredUserThemes,
  addTableTheme,
  addCardsTheme,
  addCardBackgroundTheme,
  addProfileTheme,
  getTableTheme,
  setTableTheme,
  getCardsTheme,
  setProfileTheme,
  getProfileTheme,
  setCardBackgroundTheme,
  getCardBackgroundTheme,
  setCardsTheme,
  makeNotify,
};
