import { IUserSchema } from '@utils/Types';
import { MayNotExists } from '@utils/Util';
import UserRepository from './UserRepository';

export default class BadgeRepository {
  constructor(private userRepository: UserRepository) {}

  async addBadge(userID: string, badgeID: number): Promise<void> {
    await this.userRepository.update(userID, {
      $addToSet: { badges: { id: badgeID, obtainAt: Date.now() } },
    });
  }

  async getBadges(userID: string): Promise<MayNotExists<Pick<IUserSchema, 'badges'>>> {
    return this.userRepository.find(userID, ['badges']);
  }
}
