import { debugError } from '../../utils/debugError.js';
import { DatabaseHuntingTypes } from '../../modules/hunt/types.js';
import { UserIdType } from '../../types/database.js';
import userRepository from './userRepository.js';

const executeHuntEntity = async (
  userId: UserIdType,
  huntType: DatabaseHuntingTypes,
  value: number,
  cooldown: number,
  rolls: number,
): Promise<void> => {
  await userRepository
    .updateUserWithSpecialData(userId, {
      $inc: { [huntType]: value, rolls: -rolls },
      huntCooldown: cooldown,
    })
    .catch(debugError);
};

export default { executeHuntEntity };
