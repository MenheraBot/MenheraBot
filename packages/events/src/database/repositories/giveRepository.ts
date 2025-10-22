import { BigString } from '@discordeno/bot';
import { negate } from '../../utils/miscUtils.js';
import userRepository from './userRepository.js';
import { profileBadges } from '../../modules/badges/profileBadges.js';
import { MainRedisClient } from '../databases.js';

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
