import { usersModel } from '../collections';
import { debugError } from '../../utils/debugError';
import { UserIdType } from '../../types/database';
import { RedisClient } from '../databases';
import userRepository from './userRepository';

const isUserBanned = async (userId: UserIdType): Promise<boolean> =>
  RedisClient.sismember('banned_users', `${userId}`)
    .then((result) => result !== 0)
    .catch((e) => {
      debugError(e);
      return false;
    });

const banUser = async (userId: UserIdType, reason: string): Promise<void> => {
  await addBannedUsers([userId]);
  await userRepository.updateUser(userId, { ban: true, banReason: reason });
};

const addBannedUsers = async (users: UserIdType[]): Promise<void> => {
  if (users.length === 0) return;

  await RedisClient.sadd(
    'banned_users',
    users.map((id) => `${id}`),
  ).catch(debugError);
};

const unbanUser = async (userId: UserIdType): Promise<void> => {
  await RedisClient.srem('banned_users', `${userId}`).catch(debugError);
  await userRepository.updateUser(userId, { ban: false });
};

const flushBannedUsers = async (): Promise<void> => {
  await RedisClient.del('banned_users');
};

const getAllBannedUsersId = async (): Promise<string[]> => {
  const bannedUsers = await RedisClient.smembers('banned_users');

  return bannedUsers;
};

const getAllBannedUsersIdFromMongo = async (): Promise<string[]> => {
  const bannedUsers = await usersModel.find({ ban: true }, ['id'], { lean: true });

  return bannedUsers.map((a) => a.id);
};

export default {
  isUserBanned,
  banUser,
  unbanUser,
  getAllBannedUsersIdFromMongo,
  getAllBannedUsersId,
  addBannedUsers,
  flushBannedUsers,
};
