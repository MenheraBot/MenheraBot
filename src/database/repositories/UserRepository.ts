import { Users } from '@database/Collections';
import { Document, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import { ITopResult, IUserSchema } from '@custom_types/Menhera';

export default class UserRepository {
  constructor(public userModal: typeof Users) {}

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
    await this.userModal.updateOne({ id: userId }, { ...query, lastCommandAt: Date.now() });
  }

  async findOrCreate(
    userID: string,
    projection: Array<keyof IUserSchema> = [],
  ): Promise<IUserSchema> {
    const result = await this.find(userID, projection);
    if (result) return result;

    return this.userModal.create({ id: userID, createdAt: Date.now() });
  }

  async delete(userID: string): Promise<void> {
    await this.userModal.deleteOne({ id: userID });
  }

  async find(
    userID: string,
    projection: Array<keyof IUserSchema> = [],
  ): Promise<IUserSchema | null> {
    return this.userModal.findOne({ id: userID }, projection);
  }

  async getBannedUserInfo(userID: string): Promise<IUserSchema | null> {
    return this.userModal.findOne({ id: userID }, ['ban', 'banReason'], { lean: true });
  }

  async create(userID: string): Promise<IUserSchema & Document> {
    return this.userModal.create({ id: userID });
  }

  async getTopRanking(
    field: keyof IUserSchema,
    skip: number,
    ignoreUsers: string[] = [],
    limit = 10,
  ): Promise<ITopResult[]> {
    const res = await this.userModal.find(
      { ban: false, id: { $nin: ignoreUsers } },
      [field, 'id'],
      {
        skip,
        limit,
        sort: { [field]: -1 },
        lean: true,
      },
    );

    return res.map((a) => ({ id: a.id, value: a[field] }));
  }
}
