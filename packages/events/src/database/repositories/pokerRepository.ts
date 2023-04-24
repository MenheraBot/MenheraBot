import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';

const isUserInMatch = async (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('poker_match', `${userId}`).then((r) => r === 1);

const addUsersInMatch = async (userIds: string[]): Promise<void> => {
  await MainRedisClient.sadd('poker_match', userIds);
};

export default { isUserInMatch, addUsersInMatch };
