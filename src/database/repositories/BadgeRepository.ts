import UserRepository from './UserRepository';

export default class BadgeRepository {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async addBadge(userID: string, badgeID: number): Promise<void> {
    await this.userRepository.update(userID, {
      $push: { badges: { id: badgeID, obtainAt: Date.now() } },
    });
  }
}
