import { debugError } from '../../utils/debugError';
import { RedisClient } from '../databases';
import { DatabaseRoleplayUserSchema } from '../../modules/roleplay/types';
import { UserIdType } from '../../types/database';
import { roleplayUsersModel } from '../collections';

const findUser = async (userId: UserIdType): Promise<DatabaseRoleplayUserSchema | null> => {
  const fromRedis = await RedisClient.get(`roleplay:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await roleplayUsersModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) return null;

  await RedisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(fromMongo)).catch(debugError);

  return fromMongo;
};

export default { findUser };
