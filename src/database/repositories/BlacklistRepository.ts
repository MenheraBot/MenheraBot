import UserRepository from './UserRepository';

export default class BlacklistRepository {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async ban(userID: string, reason: string): Promise<void> {
    await this.userRepository.update(userID, { ban: true, banReason: reason });
  }

  async unban(userID: string): Promise<void> {
    await this.userRepository.update(userID, { ban: false, banReason: null });
  }
}
