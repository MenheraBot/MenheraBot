module.exports = class HuntRepository {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async huntDemon(userID, value, cooldown) {
    await this.userRepository.update(userID, { $inc: { caçados: value }, caçarTime: cooldown });
  }

  async huntAngel(userID, value, cooldown) {
    await this.userRepository.update(userID, { $inc: { anjos: value }, caçarTime: cooldown });
  }

  async huntDemigod(userID, value, cooldown) {
    await this.userRepository.update(userID, { $inc: { semideuses: value }, caçarTime: cooldown });
  }

  async huntGod(userID, value, cooldown) {
    await this.userRepository.update(userID, { $inc: { deuses: value }, caçarTime: cooldown });
  }
};
