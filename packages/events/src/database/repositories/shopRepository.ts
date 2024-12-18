import { BigString } from 'discordeno/types';
import { User } from 'discordeno/transformers';
import { DatabaseHuntingTypes } from '../../modules/hunt/types';
import { AvailableThemeTypes } from '../../modules/themes/types';
import { UserColor } from '../../types/database';
import { negate } from '../../utils/miscUtils';
import profileImagesRepository from './profileImagesRepository';
import starsRepository from './starsRepository';
import themeCreditsRepository from './themeCreditsRepository';
import userRepository from './userRepository';
import userThemesRepository from './userThemesRepository';
import { postTransaction } from '../../utils/apiRequests/statistics';
import { bot } from '../..';
import { ApiTransactionReason } from '../../types/api';
import notificationRepository from './notificationRepository';

const executeSellHunt = async (
  userId: BigString,
  huntType: DatabaseHuntingTypes,
  amount: number,
  profit: number,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { [huntType]: negate(amount), estrelinhas: profit },
  });

  await postTransaction(
    `${bot.id}`,
    `${userId}`,
    profit,
    'estrelinhas',
    ApiTransactionReason.SELL_HUNT,
  );

  await postTransaction(`${userId}`, `${bot.id}`, amount, huntType, ApiTransactionReason.SELL_HUNT);
};

const executeBuyColor = async (
  userId: BigString,
  price: number,
  color: UserColor,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { estrelinhas: negate(price) },
    $push: { colors: color },
  });

  await postTransaction(
    `${userId}`,
    `${bot.id}`,
    price,
    'estrelinhas',
    ApiTransactionReason.BUY_COLOR,
  );
};

const executeBuyImage = async (
  userId: BigString,
  imageId: number,
  price: number,
  username: string,
): Promise<void> => {
  await starsRepository.removeStars(userId, price);
  await userThemesRepository.addProfileImage(userId, imageId);
  await profileImagesRepository.giveUploaderImageRoyalties(imageId, price, username);

  await postTransaction(
    `${userId}`,
    `${bot.id}`,
    price,
    'estrelinhas',
    ApiTransactionReason.BUY_IMAGE,
  );
};

const executeBuyRolls = async (userId: BigString, amount: number, price: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { rolls: amount, estrelinhas: negate(price) },
  });

  await postTransaction(
    `${userId}`,
    `${bot.id}`,
    price,
    'estrelinhas',
    ApiTransactionReason.BUY_ROLL,
  );
};

const executeBuyItem = async (userId: BigString, itemId: number, price: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { estrelinhas: negate(price) },
    $push: { inventory: { id: itemId } },
  });

  await postTransaction(
    `${userId}`,
    `${bot.id}`,
    price,
    'estrelinhas',
    ApiTransactionReason.BUY_ITEM,
  );
};

const executeBuyTheme = async (
  user: User,
  themeId: number,
  price: number,
  themeType: AvailableThemeTypes,
  royalty: number,
  themeOwner: string,
  themeName: string,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(user.id, {
    $inc: { estrelinhas: negate(price) },
  });

  postTransaction(`${user.id}`, `${bot.id}`, price, 'estrelinhas', ApiTransactionReason.BUY_THEME);

  notificationRepository.createNotification(
    themeOwner,
    'commands:notificações.notifications.user-bought-theme',
    { username: user.username, theme: themeName },
  );

  await themeCreditsRepository.giveOwnerThemeRoyalties(
    themeId,
    Math.floor((royalty / 100) * price),
  );

  switch (themeType) {
    case 'profile':
      await userThemesRepository.addProfileTheme(user.id, themeId);
      break;

    case 'cards':
      await userThemesRepository.addCardsTheme(user.id, themeId);
      break;

    case 'card_background':
      await userThemesRepository.addCardBackgroundTheme(user.id, themeId);
      break;

    case 'table':
      await userThemesRepository.addTableTheme(user.id, themeId);
      break;

    case 'eb_background':
      await userThemesRepository.addEbBackgroundTheme(user.id, themeId);
      break;

    case 'eb_text_box':
      await userThemesRepository.addEbTextBoxTheme(user.id, themeId);
      break;

    case 'eb_menhera':
      await userThemesRepository.addEbMenheraTheme(user.id, themeId);
      break;
  }
};

export default {
  executeSellHunt,
  executeBuyImage,
  executeBuyColor,
  executeBuyRolls,
  executeBuyItem,
  executeBuyTheme,
};
