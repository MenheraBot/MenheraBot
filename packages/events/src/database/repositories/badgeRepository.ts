import { BigString } from 'discordeno/types';
import { profileBadges } from '../../modules/badges/profileBadges';
import userRepository from './userRepository';

const giveBadgeToUser = async (
  userId: BigString,
  badgeId: keyof typeof profileBadges,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $addToSet: { badges: { id: badgeId, obtainAt: `${Date.now()}` } },
  });
};

export default { giveBadgeToUser };
