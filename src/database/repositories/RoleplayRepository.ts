import { RoleplayUserSchema } from '@roleplay/Types';
import { Rpgs } from '@structures/DatabaseCollections';
import { MayNotExists } from '@utils/Util';
import { UpdateQuery, UpdateWithAggregationPipeline } from 'mongoose';

export default class RoleplayRepository {
  constructor(private roleplayModal: typeof Rpgs) {}

  async registerUser(
    userId: string,
    data: Partial<RoleplayUserSchema>,
  ): Promise<RoleplayUserSchema> {
    return this.roleplayModal.create({
      id: userId,
      level: 1,
      experience: 0,
      ...data,
    });
  }

  async findUser(
    userId: string,
    projections: Array<keyof RoleplayUserSchema> = [],
  ): Promise<MayNotExists<RoleplayUserSchema>> {
    return this.roleplayModal.findOne({ id: userId }, projections);
  }

  async updateUser(
    userId: string,
    toUpdate: UpdateQuery<RoleplayUserSchema> | UpdateWithAggregationPipeline,
  ): Promise<void> {
    await this.roleplayModal.updateOne({ id: userId }, toUpdate);
  }
}
