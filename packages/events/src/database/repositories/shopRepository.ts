import { BigString } from 'discordeno/types';
import { UserColor } from 'types/database';
import { DatabaseHuntingTypes } from '../../modules/hunt/types';
import { negate } from '../../utils/miscUtils';
import userRepository from './userRepository';

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

export default { executeSellHunt, executeBuyColor, executeBuyRolls };
