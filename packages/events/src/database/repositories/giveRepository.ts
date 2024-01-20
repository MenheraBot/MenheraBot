import { BigString } from 'discordeno/types';
import { negate } from '../../utils/miscUtils';
import userRepository from './userRepository';
import { profileBadges } from '../../modules/badges/profileBadges';
import { MainRedisClient } from '../databases';

const executeGive = async (
  field: 'estrelinhas',
  fromUser: BigString,
  toUser: BigString,
  amount: number,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(fromUser, { $inc: { [field]: negate(amount) } });
  await userRepository.updateUserWithSpecialData(toUser, { $inc: { [field]: amount } });
};

const giveBadgeToUser = async (
  userId: BigString,
  badgeId: keyof typeof profileBadges,
): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $addToSet: { badges: { id: badgeId, obtainAt: `${Date.now()}` } },
  });
};

const giveTitleToUser = async (userId: BigString, titleId: number): Promise<void> => {
  await userRepository.updateUserWithSpecialData(userId, {
    $addToSet: { titles: { id: titleId, aquiredAt: Date.now() } },
  });

  await MainRedisClient.del(`titles:${userId}`);
};

export default { executeGive, giveBadgeToUser, giveTitleToUser };
