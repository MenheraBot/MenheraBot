import { Relations } from '@database/Collections';
import { FluffetyRelationshipSchema } from '@fluffety/Types';
import UserRepository from './UserRepository';

export default class RelationshipRepository {
  constructor(private userRepository: UserRepository, private relationsModal: typeof Relations) {}

  async getAllFluffetyRelations(ownerId: string): Promise<FluffetyRelationshipSchema[]> {
    return this.relationsModal.find({ $or: [{ leftOwner: ownerId }, { rightOwner: ownerId }] });
  }

  async deleteFluffetyRelation(authorId: string, targetId: string): Promise<void> {
    await this.relationsModal.deleteOne({
      $or: [
        { $and: [{ rightOwner: authorId }, { leftOwner: targetId }] },
        { $and: [{ rightOwner: targetId }, { leftOwner: authorId }] },
      ],
    });
  }

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
    this.userRepository.update(userOneID, {
      trisal: [userTwoID, userThreeID],
      lastCommandAt: Date.now(),
    });

    this.userRepository.update(userTwoID, {
      trisal: [userOneID, userThreeID],
      lastCommandAt: Date.now(),
    });

    this.userRepository.update(userThreeID, {
      trisal: [userOneID, userTwoID],
      lastCommandAt: Date.now(),
    });
  }

  async untrisal(userOneID: string, userTwoID: string, userThreeID: string): Promise<void> {
    await this.userRepository.multiUpdate([userOneID, userTwoID, userThreeID], { trisal: [] });
  }
}
