import UserRepository from './UserRepository';

export default class BadgeRepository {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async addBadge(userID: string, badgeID: number) {
    await this.userRepository.update(userID, {
      $push: { badges: { id: badgeID, obtainAt: Date.now() } },
    });
  }
}
