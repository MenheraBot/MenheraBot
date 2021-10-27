import UserRepository from './UserRepository';

export default class RelationshipRepository {
  constructor(private userRepository: UserRepository) {}

  async marry(userOneID: string, userTwoID: string, data: string): Promise<void> {
    await this.userRepository.update(userOneID, { married: userTwoID, marriedData: data });
    await this.userRepository.update(userTwoID, { married: userOneID, marriedData: data });
  }

  async divorce(userOneID: string, userTwoID: string): Promise<void> {
    await this.userRepository.update(userOneID, { married: null, marriedData: null });
    await this.userRepository.update(userTwoID, { married: null, marriedData: null });
  }

  async trisal(userOneID: string, userTwoID: string, userThreeID: string): Promise<void> {
    await this.userRepository.update(userOneID, { trisal: [userTwoID, userThreeID] });
    await this.userRepository.update(userTwoID, { trisal: [userOneID, userThreeID] });
    await this.userRepository.update(userThreeID, { trisal: [userOneID, userTwoID] });
  }

  async untrisal(userOneID: string, userTwoID: string, userThreeID: string): Promise<void> {
    await this.userRepository.multiUpdate([userOneID, userTwoID, userThreeID], { trisal: [] });
  }
}
