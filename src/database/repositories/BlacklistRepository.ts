import { Redis } from 'ioredis';
import UserRepository from './UserRepository';

export default class BlacklistRepository {
  constructor(private userRepository: UserRepository, private redisClient: Redis | null) {}

  async ban(userID: string, reason: string): Promise<void> {
    await this.userRepository.update(userID, { ban: true, banReason: reason });
    await this.addBannedUsers(userID);
  }

  async unban(userID: string): Promise<void> {
    await this.userRepository.update(userID, { ban: false, banReason: null });
    await this.removeBannedUser(userID);
  }

  async addBannedUsers(user: string[] | string): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.sadd('banned_users', user);
  }

  async removeBannedUser(user: string): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.srem('banned_users', user);
  }

  async isUserBanned(user: string): Promise<boolean> {
    if (this.redisClient) {
      const isBan = await this.redisClient.sismember('banned_users', user);
      return isBan !== 0;
    }

    const isBanned = await this.userRepository.getBannedUserInfo(user);
    if (!isBanned) return false;
    return isBanned.ban ?? false;
  }
}
