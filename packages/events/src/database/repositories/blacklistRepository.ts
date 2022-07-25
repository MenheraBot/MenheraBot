import { RedisClient } from '../databases';

const isUserBanned = async (userId: bigint): Promise<boolean> =>
  RedisClient.sismember('banned_users', `${userId}`).then((result) => result !== 0);

export default { isUserBanned };
