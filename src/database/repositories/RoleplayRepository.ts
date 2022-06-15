import { RoleplayUserSchema, UserBattleConfig } from '@roleplay/Types';
import { Rpgs } from '@database/Collections';
import HttpRequests from '@utils/HTTPrequests';
import { debugError, MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';
import { UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

export default class RoleplayRepository {
  constructor(private roleplayModal: typeof Rpgs, private redisClient: MayNotExists<Redis>) {}

  async registerUser(
    userId: string,
    data: Partial<RoleplayUserSchema>,
  ): Promise<RoleplayUserSchema> {
    return this.roleplayModal.create({
      id: userId,
      level: 1,
      experience: 0,
      ...data,
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.roleplayModal.deleteOne({ id: userId });
    if (this.redisClient)
      this.redisClient.multi().del(`roleplay:${userId}`).del(`battle_config:${userId}`).exec();
  }

  async findUser(userId: string): Promise<MayNotExists<RoleplayUserSchema>> {
    if (this.redisClient) {
      const userData = await this.redisClient
        .get(`roleplay:${userId}`)
        .catch((e) => debugError(e, true));
      if (userData) return JSON.parse(userData);
    }

    const fromDatabase = await this.roleplayModal.findOne({ id: userId });

    if (fromDatabase && this.redisClient)
      await this.redisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(fromDatabase));

    return fromDatabase;
  }

  async updateUser(
    userId: string,
    toUpdate: UpdateQuery<RoleplayUserSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    const updated = await this.roleplayModal.findOneAndUpdate({ id: userId }, toUpdate, {
      new: true,
    });

    if (this.redisClient)
      await this.redisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(updated));
  }

  async postBattle(userId: string, updatedUserState: RoleplayUserSchema): Promise<void> {
    const updated = await this.roleplayModal.findOneAndUpdate({ id: userId }, updatedUserState, {
      new: true,
    });

    if (this.redisClient)
      await this.redisClient.setex(`roleplay:${userId}`, 3600, JSON.stringify(updated));
  }

  async getUserConfigurationBattle(userId: string): Promise<MayNotExists<UserBattleConfig>> {
    if (this.redisClient) {
      const result = await this.redisClient.get(`battle_config:${userId}`);
      if (result) return JSON.parse(result);
    }

    const apiConfig = await HttpRequests.getUserBattleConfig(userId);
    if (apiConfig.error) return null;

    if (this.redisClient)
      await this.redisClient.set(`battle_config:${userId}`, JSON.stringify(apiConfig.data.config));

    return apiConfig.data.config;
  }

  async setUserConfigurationBattle(userId: string, config: UserBattleConfig): Promise<void> {
    if (this.redisClient)
      await this.redisClient.set(`battle_config:${userId}`, JSON.stringify(config));

    await HttpRequests.updateUserBattleConfig(userId, config);
  }

  async createParty(ownerId: string, users: string[]): Promise<boolean> {
    if (!this.redisClient) return false;

    const transaction = this.redisClient.multi();

    for (let i = 0; i < users.length; i++) {
      const party = { ownerId, users: users.filter((u) => u !== users[i]) };
      transaction.setex(`party:${users[i]}`, 3600, JSON.stringify(party));
    }

    const result = await transaction.exec();

    if (!result) return false;
    if (result.some((r) => r === null)) return false;
    return true;
  }

  async getUserParty(userId: string): Promise<MayNotExists<{ ownerId: string; users: string[] }>> {
    if (!this.redisClient) return null;
    const res = await this.redisClient.get(`party:${userId}`);

    if (!res) return null;
    return JSON.parse(res);
  }
}
