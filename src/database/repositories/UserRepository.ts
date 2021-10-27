import { Users } from '@structures/DatabaseCollections';
import { Document, UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';
import { ITopResult, IUserSchema, TopRankingTypes } from '@utils/Types';

export default class UserRepository {
  constructor(private userModal: typeof Users) {}

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

  async findOrCreate(
    userID: string,
    projection: Array<keyof IUserSchema> = [],
  ): Promise<IUserSchema> {
    const result = await this.find(userID, projection);
    if (result) return result;

    return this.userModal.create({ id: userID });
  }

  async delete(userID: string): Promise<void> {
    await this.userModal.deleteOne({ id: userID });
  }

  async find(
    userID: string,
    projection: Array<keyof IUserSchema> = [],
  ): Promise<IUserSchema | null> {
    return this.userModal.findOne({ id: userID }, projection, { lean: true });
  }

  async getBannedUserInfo(userID: string): Promise<(IUserSchema & Document) | null> {
    return this.userModal.findOne({ id: userID }, ['ban', 'banReason'], { lean: true });
  }

  async create(userID: string): Promise<IUserSchema & Document> {
    return this.userModal.create({ id: userID });
  }

  async getAllBannedUsersId(): Promise<string[]> {
    const bannedUsers = await this.userModal.find({ ban: true }, ['id'], { lean: true });
    return bannedUsers.map((a) => a.id);
  }

  async getTopRanking(
    field: TopRankingTypes,
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
