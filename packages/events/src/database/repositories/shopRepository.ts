import { BigString } from 'discordeno/types';
import { AvailableThemeTypes } from '../../modules/themes/types';
import { UserColor } from '../../types/database';
import { DatabaseHuntingTypes } from '../../modules/hunt/types';
import { negate } from '../../utils/miscUtils';
import userRepository from './userRepository';
import themeCreditsRepository from './themeCreditsRepository';
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
  executeBuyColor,
  executeBuyRolls,
  executeBuyItem,
  executeBuyTheme,
};
