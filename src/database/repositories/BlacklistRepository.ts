import { debugError, MayNotExists } from '@utils/Util';
import { Redis } from 'ioredis';
import UserRepository from './UserRepository';

export default class BlacklistRepository {
  constructor(private userRepository: UserRepository, private redisClient: MayNotExists<Redis>) {}

  async ban(userID: string, reason: string): Promise<void> {
    await this.userRepository.update(userID, { ban: true, banReason: reason });
    await this.addBannedUsers([userID]);
  }

  async unban(userID: string): Promise<void> {
    await this.userRepository.update(userID, { ban: false, banReason: null });
    await this.removeBannedUser(userID);
  }

  async addBannedUsers(user: string[]): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.sadd('banned_users', user).catch((e) => debugError(e, true));
  }

  async removeBannedUser(user: string): Promise<void> {
    if (!this.redisClient) return;
    await this.redisClient.srem('banned_users', user).catch((e) => debugError(e, true));
  }

  async getAllBannedUsersId(): Promise<string[]> {
    const bannedUsers = await this.userRepository.userModal.find({ ban: true }, ['id'], {
      lean: true,
    });

    return bannedUsers.map((a) => a.id);
  }

  async isUserBanned(user: string): Promise<boolean> {
    const query = async () => {
      const isBanned = await this.userRepository.getBannedUserInfo(user);
      if (!isBanned) return false;
      return isBanned.ban ?? false;
    };

    if (this.redisClient)
      return this.redisClient
        .sismember('banned_users', user)
        .then((res) => res !== 0)
        .catch(() => query());

    return query();
  }
}
