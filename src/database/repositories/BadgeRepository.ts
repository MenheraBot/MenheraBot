import UserRepository from './UserRepository';

export default class BadgeRepository {
  constructor(private userRepository: UserRepository) {}

  async addBadge(userID: string, badgeID: number): Promise<void> {
    await this.userRepository.update(userID, {
      $addToSet: { badges: { id: badgeID, obtainAt: Date.now() } },
    });
  }
}
