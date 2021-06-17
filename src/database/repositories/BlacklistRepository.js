module.exports = class BlacklistRepository {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async ban(userID, reason) {
    await this.userRepository.update(userID, { ban: true, banReason: reason });
  }

  async unban(userID) {
    await this.userRepository.update(userID, { ban: false, banReason: null });
  }
};
