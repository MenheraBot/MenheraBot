import { Rpg } from '@structures/DatabaseCollections';
import { IUserRpgSchema } from '@utils/Types';
import { UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

export default class RpgRepository {
  constructor(private rpgModal: typeof Rpg) {
    this.rpgModal = rpgModal;
  }

  async find(userID: string): Promise<IUserRpgSchema | null> {
    return this.rpgModal.findById(userID);
  }

  async update(
    userID: string,
    query: UpdateQuery<IUserRpgSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    await this.rpgModal.updateOne({ _id: userID }, query);
  }

  async create(userID: string, userClass: string): Promise<IUserRpgSchema> {
    return this.rpgModal.create({ _id: userID, class: userClass });
  }

  async delete(userID: string): Promise<void> {
    await this.rpgModal.deleteOne({ _id: userID });
  }
}
