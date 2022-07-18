import UserRepository from './UserRepository';

export default class RelationshipRepository {
  constructor(private userRepository: UserRepository) {}

  async marry(userOneID: string, userTwoID: string, data: string): Promise<void> {
    const marryTimestamp = Date.now();

    this.userRepository.update(userOneID, {
      married: userTwoID,
      marriedDate: data,
      marriedAt: marryTimestamp,
      lastCommandAt: marryTimestamp,
    });

    this.userRepository.update(userTwoID, {
      married: userOneID,
      marriedDate: data,
      marriedAt: marryTimestamp,
      lastCommandAt: marryTimestamp,
    });
  }

  async divorce(userOneID: string, userTwoID: string): Promise<void> {
    this.userRepository.update(userOneID, {
      married: null,
      marriedDate: null,
      marriedAt: null,
      lastCommandAt: Date.now(),
    });

    this.userRepository.update(userTwoID, {
      married: null,
      marriedDate: null,
      marriedAt: null,
      lastCommandAt: Date.now(),
    });
  }

  async trisal(userOneID: string, userTwoID: string, userThreeID: string): Promise<void> {
    await this.userRepository.multiUpdate([userOneID, userTwoID, userThreeID], {
      trisal: [userOneID, userTwoID, userThreeID],
      lastCommandAt: Date.now(),
    });
  }

  async untrisal(userOneID: string, userTwoID: string, userThreeID: string): Promise<void> {
    await this.userRepository.multiUpdate([userOneID, userTwoID, userThreeID], { trisal: [] });
  }
}
