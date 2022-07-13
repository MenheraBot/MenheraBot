import { debugError, MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';

export default class PokerRepository {
  constructor(private redisClient: MayNotExists<Redis>) {}

  async isUserInPokerMatch(userId: string): Promise<boolean> {
    if (!this.redisClient) return false;
    const res = await this.redisClient.sismember('poker_match', userId);
    return res === 1;
  }

  async addUserToPokerMatch(userId: string): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.sadd('poker_matchs', userId).catch(debugError);
  }

  async removeUserFromPokerMatch(userId: string): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.srem('poker_match', userId).catch(debugError);
  }
}
