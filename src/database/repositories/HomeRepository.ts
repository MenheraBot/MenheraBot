import { Homes } from '@structures/DatabaseCollections';
import { IHomeSchema } from 'roleplay/Types';
import { Document } from 'mongoose';

export default class HomeRepository {
  constructor(private homeModal: typeof Homes) {}

  async getAllUserHomes(userId: string): Promise<(IHomeSchema & Document)[]> {
    return this.homeModal.find({ ownerId: userId });
  }

  async getHomeById(homeId: string): Promise<IHomeSchema | null> {
    return this.homeModal.findById(homeId);
  }
}
