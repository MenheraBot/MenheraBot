import UserRepository from './UserRepository';

export default class RelationshipRepository {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async marry(userOneID: string, userTwoID: string, data: string) {
    await this.userRepository.update(userOneID, { casado: userTwoID, data });
    await this.userRepository.update(userTwoID, { casado: userOneID, data });
  }

  async divorce(userOneID: string, userTwoID: string) {
    await this.userRepository.update(userOneID, { casado: 'false', data: null });
    await this.userRepository.update(userTwoID, { casado: 'false', data: null });
  }

  async trisal(userOneID: string, userTwoID: string, userThreeID: string) {
    await this.userRepository.update(userOneID, { trisal: [userTwoID, userThreeID] });
    await this.userRepository.update(userTwoID, { trisal: [userOneID, userThreeID] });
    await this.userRepository.update(userThreeID, { trisal: [userOneID, userTwoID] });
  }

  async untrisal(userOneID, userTwoID, userThreeID) {
    await this.userRepository.multiUpdate([userOneID, userTwoID, userThreeID], { trisal: [] });
  }
}
