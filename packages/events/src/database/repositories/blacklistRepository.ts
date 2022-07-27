import { UserIdType } from '../../types/database';
import { RedisClient } from '../databases';

const isUserBanned = async (userId: UserIdType): Promise<boolean> =>
  RedisClient.sismember('banned_users', `${userId}`).then((result) => result !== 0);

export default { isUserBanned };
