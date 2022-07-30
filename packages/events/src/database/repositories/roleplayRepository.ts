import { RedisClient } from '../databases';
import { DatabaseRoleplayUserSchema } from '../../modules/roleplay/types';
import { UserIdType } from '../../types/database';
import { roleplayUsersModel } from '../collections';

const findUser = async (userId: UserIdType): Promise<DatabaseRoleplayUserSchema | null> => {
  const fromRedis = await RedisClient.get(`roleplay:${userId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await roleplayUsersModel.findOne({ id: userId });

  if (!fromMongo) return null;

  await RedisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(fromMongo));

  return fromMongo;
};

export default { findUser };
