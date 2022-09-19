import { BigString } from 'discordeno/types';
import userRepository from './userRepository';

const giveBadgeToUser = async (userId: BigString, badgeId: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $addToSet: { badges: { id: badgeId, obtainAt: `${Date.now()}` } },
  });
};

export default { giveBadgeToUser };
