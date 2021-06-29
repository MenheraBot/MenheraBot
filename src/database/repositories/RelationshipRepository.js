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

  async trisal(userOneID, userTwoID, userThreeID) {
    await this.userRepository.update(userOneID, { trisal: [userTwoID, userThreeID] });
    await this.userRepository.update(userTwoID, { trisal: [userOneID, userThreeID] });
    await this.userRepository.update(userThreeID, { trisal: [userOneID, userTwoID] });
  }

  async untrisal(userOneID, userTwoID, userThreeID) {
    await this.userRepository.multiUpdate([userOneID, userTwoID, userThreeID], { trisal: [] });
  }
};
