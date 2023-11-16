import { usersModel } from '../collections';
import { debugError } from '../../utils/debugError';
import { UserIdType } from '../../types/database';
import { MainRedisClient } from '../databases';
import userRepository from './userRepository';

const isUserBanned = async (userId: UserIdType): Promise<boolean> =>
  MainRedisClient.sismember('banned_users', `${userId}`)
    .then((result) => result !== 0)
    .catch((e) => {
      debugError(e);
      return false;
    });

const banUser = async (userId: UserIdType, reason: string): Promise<void> => {
  await addBannedUsers([userId]);
  await userRepository.updateUser(userId, {
    ban: true,
    banReason: reason,
    bannedSince: `${Date.now()}`,
  });
};

const addBannedUsers = async (users: UserIdType[]): Promise<void> => {
  if (users.length === 0) return;

  await MainRedisClient.sadd(
    'banned_users',
    users.map((id) => `${id}`),
  ).catch(debugError);
};

const unbanUser = async (userId: UserIdType): Promise<void> => {
  await MainRedisClient.srem('banned_users', `${userId}`).catch(debugError);
  await userRepository.updateUser(userId, { ban: false });
};

const flushBannedUsers = async (): Promise<void> => {
  await MainRedisClient.del('banned_users');
};

const getAllBannedUsersId = async (): Promise<string[]> => {
  const bannedUsers = await MainRedisClient.smembers('banned_users');

  return bannedUsers;
};

const getAllBannedUsersIdFromMongo = async (): Promise<string[]> => {
  const bannedUsers = await usersModel.find({ ban: true }, ['id'], { lean: true });

  return bannedUsers.map((a) => a.id);
};

const constructBannedUsers = async (): Promise<void> => {
  await flushBannedUsers();
  const allBannedUsers = await getAllBannedUsersIdFromMongo();
  await addBannedUsers(allBannedUsers);
};

export default {
  isUserBanned,
  banUser,
  unbanUser,
  getAllBannedUsersIdFromMongo,
  getAllBannedUsersId,
  constructBannedUsers,
  addBannedUsers,
  flushBannedUsers,
};
