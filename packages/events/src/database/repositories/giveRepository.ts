import { BigString } from 'discordeno/types';
import { DatabaseHuntingTypes } from '../../modules/hunt/types';
import { negate } from '../../utils/miscUtils';
import userRepository from './userRepository';

const executeGive = async (
  field: DatabaseHuntingTypes | 'estrelinhas',
  fromUser: BigString,
  toUser: BigString,
  amount: number,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(fromUser, { $inc: { [field]: negate(amount) } });
  await userRepository.updateUserWithSpecialData(toUser, { $inc: { [field]: amount } });
};

export default { executeGive };
