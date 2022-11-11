import { BigString } from 'discordeno/types';
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

export default { executeSellHunt };
