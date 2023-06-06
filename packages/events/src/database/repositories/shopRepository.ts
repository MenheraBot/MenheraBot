import { BigString } from 'discordeno/types';
import { DatabaseHuntingTypes } from '../../modules/hunt/types';
import { AvailableThemeTypes } from '../../modules/themes/types';
import { UserColor } from '../../types/database';
import { negate } from '../../utils/miscUtils';
import profileImagesRepository from './profileImagesRepository';
import starsRepository from './starsRepository';
import themeCreditsRepository from './themeCreditsRepository';
import userRepository from './userRepository';
import userThemesRepository from './userThemesRepository';

const executeSellHunt = async (
  userId: BigString,
  huntType: DatabaseHuntingTypes,
  amount: number,
  profit: number,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { [huntType]: negate(amount), estrelinhas: profit },
  });
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
};

const executeBuyImage = async (
  userId: BigString,
  imageId: number,
  price: number,
): Promise<void> => {
  await starsRepository.removeStars(userId, price);
  await userThemesRepository.addProfileImage(userId, imageId);
  await profileImagesRepository.giveUploaderImageRoyalties(imageId, price);
};

const executeBuyRolls = async (userId: BigString, amount: number, price: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { rolls: amount, estrelinhas: negate(price) },
  });
};

const executeBuyItem = async (userId: BigString, itemId: number, price: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { estrelinhas: negate(price) },
    $push: { inventory: { id: itemId } },
  });
};

const executeBuyTheme = async (
  userId: BigString,
  themeId: number,
  price: number,
  themeType: AvailableThemeTypes,
  royalty: number,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { estrelinhas: negate(price) },
  });

  await themeCreditsRepository.giveOwnerThemeRoyalties(
    themeId,
    Math.floor((royalty / 100) * price),
  );

  switch (themeType) {
    case 'profile':
      await userThemesRepository.addProfileTheme(userId, themeId);
      break;

    case 'cards':
      await userThemesRepository.addCardsTheme(userId, themeId);
      break;

    case 'card_background':
      await userThemesRepository.addCardBackgroundTheme(userId, themeId);
      break;

    case 'table':
      await userThemesRepository.addTableTheme(userId, themeId);
      break;

    case 'eb_background':
      await userThemesRepository.addEbBackgroundTheme(userId, themeId);
      break;

    case 'eb_text_box':
      await userThemesRepository.addEbTextBoxTheme(userId, themeId);
      break;

    case 'eb_menhera':
      await userThemesRepository.addEbMenheraTheme(userId, themeId);
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
