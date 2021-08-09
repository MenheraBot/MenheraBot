import { Users } from '@structures/DatabaseCollections';
import { Document, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import { IUserSchema } from '@utils/Types';

export default class UserRepository {
  constructor(private userModal: typeof Users) {
    this.userModal = userModal;
  }

  async multiUpdate(
    IDs: Array<string>,
    query: UpdateQuery<IUserSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    await this.userModal.updateMany({ id: { $in: IDs } }, query);
  }

  async update(
    userId: string,
    query: UpdateQuery<IUserSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    await this.userModal.updateOne({ id: userId }, query);
  }

  async findOrCreate(userID: string): Promise<IUserSchema & Document> {
    const result = await this.find(userID);
    if (result) return result;

    return this.userModal.create({ id: userID });
  }

  async delete(userID: string): Promise<void> {
    await this.userModal.deleteOne({ id: userID });
  }

  async find(userID: string): Promise<(IUserSchema & Document) | null> {
    return this.userModal.findOne({ id: userID });
  }

  async create(userID: string): Promise<IUserSchema & Document> {
    return this.userModal.create({ id: userID, shipValue: Math.floor(Math.random() * 55) });
  }

  async findAfkByIDs(ids: Array<string>): Promise<(IUserSchema & Document)[] | null> {
    return this.userModal.find({ id: { $in: ids }, afk: true });
  }
}
