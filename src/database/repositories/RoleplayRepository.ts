import { RoleplayUserSchema } from '@roleplay/Types';
import { Rpgs } from '@structures/DatabaseCollections';
import { MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';
import { UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

export default class RoleplayRepository {
  constructor(private roleplayModal: typeof Rpgs, public redisClient: MayNotExists<Redis>) {}

  async registerUser(
    userId: string,
    data: Partial<RoleplayUserSchema>,
  ): Promise<RoleplayUserSchema> {
    return this.roleplayModal.create({
      id: userId,
      level: 1,
      experience: 0,
      createdAt: Date.now(),
      ...data,
    });
  }

  async findUser(userId: string): Promise<MayNotExists<RoleplayUserSchema>> {
    /*   if (this.redisClient) {
      const userData = await this.redisClient
        .get(`roleplay:${userId}`)
        .catch((e) => debugError(e, true));
      if (userData) return JSON.parse(userData);
    }
 */
    const fromDatabase = await this.roleplayModal.findOne({ id: userId });

    /*  if (fromDatabase && this.redisClient) {
      await this.redisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(fromDatabase));
    }
 */
    return fromDatabase;
  }

  async updateUser(
    userId: string,
    toUpdate: UpdateQuery<RoleplayUserSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    /*  const updated = */ await this.roleplayModal.updateOne({ id: userId }, toUpdate, {
      returnOriginal: false,
    });

    /*   if (this.redisClient)
      await this.redisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(updated)); */
  }

  async postBattle(userId: string, updatedUserState: RoleplayUserSchema): Promise<void> {
    /*   const updated =  */ await this.roleplayModal.updateOne({ id: userId }, updatedUserState, {
      returnOriginal: false,
    });

    /*   if (this.redisClient)
      await this.redisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(updated)); */
  }
}
