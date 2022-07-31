import { DatabaseHuntingTypes } from '../../modules/hunt/types';
import { UserIdType } from '../../types/database';
import userRepository from './userRepository';

const executeHuntEntity = async (
  userId: UserIdType,
  huntType: DatabaseHuntingTypes,
  value: number,
  cooldown: number,
  rolls: number,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $inc: { [huntType]: value, rolls: -rolls },
    huntCooldown: cooldown,
    lastCommandAt: Date.now(),
  });
};

export default { executeHuntEntity };
