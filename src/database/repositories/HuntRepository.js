module.exports = class HuntRepository {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async huntDemon(userID, value, cooldown) {
    await this.userRepository.update(userID, { caçados: value, caçarTime: cooldown });
  }

  async huntAngel(userID, value, cooldown) {
    await this.userRepository.update(userID, { anjos: value, caçarTime: cooldown });
  }

  async huntDemigod(userID, value, cooldown) {
    await this.userRepository.update(userID, { semideuses: value, caçarTime: cooldown });
  }

  async huntGod(userID, value, cooldown) {
    await this.userRepository.update(userID, { deuses: value, caçarTime: cooldown });
  }
};
