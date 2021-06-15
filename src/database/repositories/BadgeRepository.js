module.exports = class BadgeRepository {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async addBadge(userID, badgeID) {
    await this.userRepository.update(userID, { $push: { badges: { id: badgeID, obtainAt: Date.now() } } });
  }
};
