module.exports = class RelationshipRepository {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async marry(userOneID, userTwoID, data) {
    await this.userRepository.update(userOneID, { casado: userTwoID, data });
    await this.userRepository.update(userTwoID, { casado: userOneID, data });
  }

  async divorce(userOneID, userTwoID) {
    await this.userRepository.update(userOneID, { casado: 'false', data: null });
    await this.userRepository.update(userTwoID, { casado: 'false', data: null });
  }
};
